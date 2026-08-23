#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["mistune==3.3.2", "jinja2>=3,<4", "pyyaml==6.0.2"]
# ///
"""Render the ReSpec spec docs/spec/index.html from spec/sections/*.md.

Pipeline: source (Markdown + Jinja2 macros) -> macro expansion -> section tree
+ RFC2119 / :dfn / :::example / :::note transforms -> mistune (Markdown -> HTML)
-> wrap in the ReSpec <section> skeleton + respecConfig. ReSpec JS then does the
numbering, bibliography, cross-references and TR styling client-side.

mistune (escape=False) passes ReSpec notation through verbatim - [[JSONSCHEMA]],
[=term=], [](#id), inline <dfn> - so ReSpec resolves them. Shared resources
(examples, the keyword vocabulary) come from macros.py, the same module the
zensical guide uses, so there is a single source.
"""
import json
import os
import re
import subprocess
import sys
from html import escape as escape_html

import mistune
from jinja2 import Environment

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
for path in (ROOT, HERE):
    if path not in sys.path:
        sys.path.insert(0, path)
import macros  # noqa: E402  - repo-root shared macros
import spec_config as cfg  # noqa: E402
from rule_ids import MARKER as RULE  # noqa: E402
from rule_scope import sentence_end  # noqa: E402
from section_scope import is_informative  # noqa: E402

SECTIONS_DIR = os.path.join(ROOT, "spec", "sections")
OUT = os.path.join(ROOT, "docs", "spec", "index.html")
RULES_FILE = os.path.join(ROOT, "meta", "oold-rules.json")

RFC2119 = re.compile(r"\b(MUST NOT|MUST|SHALL NOT|SHALL|SHOULD NOT|SHOULD|REQUIRED|RECOMMENDED|MAY|OPTIONAL)\b")
HEADING = re.compile(r"^(#{2,6})\s+(.*?)\s*$")
ATTRS = re.compile(r"\s*\{([^}]*)\}\s*$")
DFN = re.compile(r':dfn\[([^\]]*)\]\{lt="([^"]*)"\}')
CONTAINER = re.compile(r'^:::(example|note)\{([^}]*)\}[ \t]*\n(.*?)\n:::[ \t]*$', re.S | re.M)
# Paired text tokens marking a rule's sentence, mirroring @@BLOCK{n}@@ below: the real <span>
# is substituted in only after md_to_html has run - see expand_rule_spans for why.
RULE_OPEN = re.compile(r"@@RULEOPEN(\d+)@@")
RULE_CLOSE = re.compile(r"@@RULECLOSE(\d+)@@")

_md = mistune.create_markdown(escape=False, plugins=["table"])


def md_to_html(text):
    return _md(text).strip()


def _load_rule_summaries():
    """id -> summary from the generated catalog, or {} if it is absent or unparseable.

    `make spec` regenerates meta/oold-rules.json immediately before this script runs, so it
    is fresh. But a checkout predating the catalog - or a manual `render_spec.py` run - still
    has to render, so a missing/broken file degrades to no summaries rather than a crash.
    """
    try:
        with open(RULES_FILE, encoding="utf-8") as handle:
            catalog = json.load(handle)
        return {r["id"]: r["summary"] for r in catalog.get("rules", []) if r.get("id") and r.get("summary")}
    except (OSError, ValueError, KeyError):
        return {}


RULE_SUMMARIES = _load_rule_summaries()


def _mark_rules(text, rules):
    """Replace each :rule[...] marker in `text` with a pair of placeholder tokens spanning the
    sentence it marks: @@RULEOPEN{n}@@ where the marker sat, @@RULECLOSE{n}@@ at the sentence's
    end. Plain text tokens, not HTML - see RULE_OPEN/RULE_CLOSE above for why the real <span>
    is substituted later, not here.

    A marked sentence never spans a line break (confirmed across the whole marked corpus - see
    rule_scope), and sentence_end() itself assumes a single line, so markers are found and
    closed per source line rather than against the whole (possibly multi-line) `text` this is
    called with. `rules` is per render_body()/md_inline() call (like `blocks` in render_body),
    so a :::note body rendered by a recursive render_body call expands its own tokens before
    its HTML is spliced back into the caller.
    """
    if not RULE.search(text):
        return text
    lines = text.split("\n")
    for i, line in enumerate(lines):
        matches = list(RULE.finditer(line))
        if not matches:
            continue
        out, cursor = [], 0
        for match in matches:
            stop = sentence_end(line, match.end())
            rules.append((match.group(1), match.group(2)))
            idx = len(rules) - 1
            out.append(line[cursor : match.start()])
            out.append(f"@@RULEOPEN{idx}@@")
            out.append(line[match.end() : stop])
            out.append(f"@@RULECLOSE{idx}@@")
            cursor = stop
        out.append(line[cursor:])
        lines[i] = "".join(out)
    return "\n".join(lines)


def rule_span_open(rule_id, attrs):
    """The opening <span> tag for a marked sentence; paired with a literal `</span>` wherever
    expand_rule_spans finds that rule's RULE_CLOSE token.

    `tabindex="0" role="link"` makes the sentence keyboard-reachable and identifies it to
    assistive tech as link-like, even though it cannot literally be an <a> - a rule sentence
    can contain real links (cross-references, external refs), and an <a> cannot nest inside
    another <a>; see the click/keydown handlers in TAB_ASSETS. The tooltip summary comes from
    the generated catalog first (kept in sync with the CLI), then the marker's own `summary=`
    attribute, then the bare id - so this never depends on the catalog existing.
    """
    summary = RULE_SUMMARIES.get(rule_id)
    if summary is None:
        m = re.search(r'summary\s*=\s*"([^"]*)"', attrs)
        summary = m.group(1) if m else None
    title = f"{rule_id} - {summary}" if summary else rule_id
    return (
        f'<span class="rule" id="{rule_id}" tabindex="0" role="link" '
        f'title="{escape_html(title, quote=True)}">'
    )


def expand_rule_spans(html, rules):
    """Substitute RULE_OPEN/RULE_CLOSE tokens for the real <span>/</span>.

    Done after md_to_html (and, in render_body, after wrap_rfc2119) for two reasons: a raw
    <span> sitting at the start of a line would otherwise be parsed by mistune as a block-level
    HTML block, silently dropping the paragraph around it; and a summary containing an RFC 2119
    keyword would otherwise pass through wrap_rfc2119, which would inject
    <em class="rfc2119"> inside the title attribute. No summary does today, but that is luck,
    not design.
    """
    if not rules:
        return html
    html = RULE_OPEN.sub(lambda m: rule_span_open(*rules[int(m.group(1))]), html)
    return RULE_CLOSE.sub("</span>", html)


def md_inline(text):
    """Render inline Markdown (headings, <dd> text); strip the wrapping <p>."""
    text = DFN.sub(r'<dfn data-lt="\2">\1</dfn>', text)
    rules = []
    text = _mark_rules(text, rules)
    html = md_to_html(text)
    if html.startswith("<p>") and html.endswith("</p>"):
        html = html[3:-4]
    return expand_rule_spans(html, rules)


def expand(text):
    """Expand Jinja2 macros (example, vocabulary, ...) in a section source.

    Comment delimiters are moved off the default "{# #}" so they don't collide
    with heading-attribute syntax like `## Title {#section-id}`.
    """
    env = Environment(comment_start_string="{##!", comment_end_string="!##}")
    macros.TARGET = "spec"  # target-aware macros (ref/term) emit ReSpec notation
    for macro in macros.SHARED_MACROS:
        env.globals[macro.__name__] = macro
    return env.from_string(text).render()


def wrap_rfc2119(text):
    """Wrap RFC 2119 keywords in <em class="rfc2119">, skipping code."""
    out = []
    for i, chunk in enumerate(re.split(r"(```.*?```)", text, flags=re.S)):
        if i % 2 == 1:  # fenced code block - leave untouched
            out.append(chunk)
            continue
        for j, seg in enumerate(re.split(r"(`[^`]*`)", chunk)):
            out.append(seg if j % 2 == 1 else RFC2119.sub(r'<em class="rfc2119">\1</em>', seg))
    return "".join(out)


def render_body(text, informative):
    """Render a section body: :::example/:::note blocks, :dfn, RFC2119, Markdown."""
    blocks = []
    rules = []

    def stash(match):
        kind, attrs, inner = match.group(1), match.group(2), match.group(3)
        tm = re.search(r'title="([^"]*)"', attrs)
        title = f' title="{tm.group(1)}"' if tm else ""
        if kind == "example":
            html = f'<aside class="example"{title}>{md_to_html(inner)}</aside>'
        else:
            html = f'<div class="note"{title}>{render_body(inner, informative)}</div>'
        blocks.append(html)
        return f"\n@@BLOCK{len(blocks) - 1}@@\n"

    text = CONTAINER.sub(stash, text)
    text = DFN.sub(r'<dfn data-lt="\2">\1</dfn>', text)
    # Before wrap_rfc2119: a rule id/attrs must never be touched by it, and sentence_end() has
    # to see the original markdown line, not one with <em class="rfc2119"> already spliced in,
    # which would shift the offsets it searches.
    text = _mark_rules(text, rules)
    if not informative:
        text = wrap_rfc2119(text)
    html = md_to_html(text)
    # Expand rule tokens into spans before expanding @@BLOCK{n}@@: a :::note body was rendered
    # by a recursive render_body call above and already expanded its own tokens with its own
    # `rules` list, so its spliced-in HTML holds none left over. Expanding after the splice
    # would let the inner and outer token indices collide.
    html = expand_rule_spans(html, rules)
    html = re.sub(r"<p>@@BLOCK(\d+)@@</p>", lambda m: blocks[int(m.group(1))], html)
    html = re.sub(r"@@BLOCK(\d+)@@", lambda m: blocks[int(m.group(1))], html)
    return html


def parse_sections(text):
    """Build a nested section tree from ATX headings carrying {#id .class}."""
    root, stack = [], []
    for line in text.split("\n"):
        m = HEADING.match(line)
        if m:
            level, title = len(m.group(1)), m.group(2)
            nid, classes = None, []
            am = ATTRS.search(title)
            if am:
                title = title[: am.start()].rstrip()
                for tok in am.group(1).split():
                    if tok.startswith("#"):
                        nid = tok[1:]
                    elif tok.startswith("."):
                        classes.append(tok[1:])
            node = {"level": level, "title": title, "id": nid, "classes": classes, "body": [], "children": []}
            while stack and stack[-1]["level"] >= level:
                stack.pop()
            (stack[-1]["children"] if stack else root).append(node)
            stack.append(node)
        elif stack:
            stack[-1]["body"].append(line)
    return root


def render_node(node, informative):
    informative = is_informative(node["id"], node["classes"], informative)
    attrs = f' id="{node["id"]}"' if node["id"] else ""
    if node["classes"]:
        attrs += f' class="{" ".join(node["classes"])}"'
    body = render_body("\n".join(node["body"]), informative)
    children = "".join(render_node(c, informative) for c in node["children"])
    return f'<section{attrs}><h{node["level"]}>{md_inline(node["title"])}</h{node["level"]}>{body}{children}</section>'


def render_file(entry):
    text = expand(open(os.path.join(SECTIONS_DIR, entry["file"]), encoding="utf-8").read())
    if entry.get("headingless"):
        return f'<section id="{entry["id"]}">\n{render_body(text, False)}\n</section>'
    return "\n".join(render_node(n, False) for n in parse_sections(text))


def render_terminology():
    items = "\n".join(
        f'  <dt><dfn data-lt="{t["lt"]}">{t["term"]}</dfn></dt>\n  <dd>{md_inline(t["def"])}</dd>'
        for t in cfg.TERMINOLOGY
    )
    return (
        '<section id="terminology">\n  <h2>Terminology</h2>\n'
        "  <p>The following terms are used throughout this specification:</p>\n"
        f"  <dl>\n{items}\n  </dl>\n</section>"
    )


def render_index():
    refs = ", ".join(f"[={r}=]" for r in cfg.INDEX_TERMS)
    return (
        '<section id="index" class="appendix">\n  <h2>Index of Terms</h2>\n'
        f"  <p>The following defined terms are used in this specification: {refs}.</p>\n</section>"
    )


# Styling + toggle for the JSON / "View as YAML" example tabs emitted by
# macros._spec_tabs. Kept minimal and dependency-free; injected into <head>.
TAB_ASSETS = """  <style>
    .ex-tabs { margin: 1em 0; }
    .ex-tablist { display: flex; gap: .25rem; border-bottom: 1px solid #ccc; margin-bottom: .5em; }
    .ex-tab { border: 0; background: none; padding: .3em .8em; cursor: pointer; font: inherit; color: #555; border-bottom: 2px solid transparent; }
    .ex-tab[aria-selected="true"] { color: #005a9c; border-bottom-color: #005a9c; font-weight: 600; }
    .ex-panel[hidden] { display: none; }
    /* The specification text must look exactly as it does today when idle: no underline,
       colour, background or font change. The affordance appears only on hover, on keyboard
       focus, and when the sentence is the current #fragment. */
    .rule { cursor: pointer; }
    .rule:hover { background: #eef4fa; }
    .rule:focus-visible { outline: 2px solid #005a9c; outline-offset: 2px; }
    .rule:target { background: #fffbdd; scroll-margin-top: 3rem; }
  </style>
  <script>
    // Toggle the JSON / YAML example tabs (event delegation; runs regardless of ReSpec).
    document.addEventListener("click", function (e) {
      var tab = e.target.closest(".ex-tab");
      if (!tab) return;
      var group = tab.closest(".ex-tabs");
      group.querySelectorAll(".ex-tab").forEach(function (b) {
        b.setAttribute("aria-selected", b === tab ? "true" : "false");
      });
      group.querySelectorAll(".ex-panel").forEach(function (p) {
        p.hidden = (p.id !== tab.dataset.panel);
      });
    });
    // Deep-link a marked rule sentence. It cannot be wrapped in an <a> - a rule sentence can
    // contain real links (cross-references, external refs) and an <a> cannot nest inside
    // another <a> - so a click (or Enter/Space while it has keyboard focus, since it carries
    // tabindex="0") sets the URL fragment instead.
    document.addEventListener("click", function (event) {
      var rule = event.target.closest(".rule");
      if (!rule) return;
      if (event.target.closest("a")) return;  // a real link inside the sentence wins
      location.hash = rule.id;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var rule = event.target.closest(".rule");
      if (!rule) return;
      event.preventDefault();
      location.hash = rule.id;
    });
  </script>"""


def render_head():
    respec = json.dumps(cfg.RESPEC, indent=2, ensure_ascii=False)
    tab_assets = TAB_ASSETS
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OO-LD Schema</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://www.w3.org/Tools/respec/respec-w3c" class="remove" defer></script>
  <script class="remove">
    // ReSpec configuration. See https://respec.org/docs/ for all options.
    var respecConfig = {respec};
  </script>
  <script type="module">
    // ReSpec has no native Mermaid support, so we render `pre.mermaid` blocks
    // ourselves - after ReSpec has finished rearranging the DOM.
    import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
    mermaid.initialize({{ startOnLoad: false, theme: "neutral" }});
    const runMermaid = () => mermaid.run({{ querySelector: ".mermaid" }}).catch(e => console.error("mermaid", e));
    const schedule = () => setTimeout(runMermaid, 500);  // let ReSpec finish rearranging first
    if (document.readyState === "complete") schedule(); else window.addEventListener("load", schedule);
  </script>
{tab_assets}
</head>
<body>
<p class="copyright">Copyright &copy; the OO-LD contributors. This document is made available under the <a rel="license" href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a> Public Domain Dedication; W3C liability, trademark and document-license rules do <strong>not</strong> apply.</p>"""


def _git_version():
    """Spec version from git so the ReSpec subtitle stays in sync with releases.

    Uses the most recent tag name only (stable between releases, so the committed
    docs/spec/index.html does not churn on every commit); falls back to a short
    commit id, then "draft", when no tag is reachable. CI needs full history
    (fetch-depth: 0) for `git describe` to find the tag.
    """
    for cmd in (["git", "describe", "--tags", "--abbrev=0"], ["git", "rev-parse", "--short", "HEAD"]):
        try:
            out = subprocess.check_output(cmd, cwd=ROOT, stderr=subprocess.DEVNULL, text=True).strip()
            if out:
                return out
        except Exception:
            pass
    return "draft"


def build():
    cfg.RESPEC["subtitle"] = f"Version {_git_version()}"
    parts = []
    for entry in cfg.SECTIONS:
        if entry.get("generate") == "terminology":
            parts.append(render_terminology())
        elif entry.get("generate") == "index":
            parts.append(render_index())
        else:
            parts.append(render_file(entry))
    body = "\n\n".join(parts)
    body = body.replace("<table>", '<table class="def">')  # ReSpec definition tables
    # Mermaid: expose fenced ```mermaid blocks as <pre class="mermaid"> for the
    # loader in the document head (ReSpec renders them as plain code otherwise).
    body = re.sub(r'<pre><code class="language-mermaid">(.*?)</code></pre>',
                  r'<div class="mermaid">\1</div>', body, flags=re.S)
    body = re.sub(r"\n{3,}", "\n\n", body)
    banner = "<!-- DO NOT EDIT - generated by scripts/render_spec.py from spec/. Edit the Markdown source and run `make spec`. -->"
    head = render_head().replace("<!DOCTYPE html>", "<!DOCTYPE html>\n" + banner)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(f"{head}\n\n{body}\n\n</body>\n</html>\n")
    print(f"Wrote {OUT} ({len(cfg.SECTIONS)} sections)")


if __name__ == "__main__":
    build()
