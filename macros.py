"""Shared documentation macros - the single source of truth for reused resources.

Registered with zensical's macros extension for the guide (docs/) and reused by
the /spec renderer so both renderers consume identical output. Every macro
returns plain Markdown (or HTML) that either renderer can process, so examples,
the keyword vocabulary, etc. live in exactly one place (examples/, meta/, ...).
"""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

# Render target, set by each renderer ("docs" for zensical, "spec" for the
# ReSpec renderer). Target-aware macros (e.g. a future ref()/term()) branch on it.
TARGET = "docs"

# Fence language inferred from the file extension for inline_file(lang="auto").
_LANG_BY_EXT = {
    ".json": "json", ".md": "markdown", ".yaml": "yaml", ".yml": "yaml",
    ".py": "python", ".mjs": "javascript", ".js": "javascript",
    ".sh": "bash", ".ttl": "turtle", ".html": "html",
}


_ex_counter = [0]  # unique ids for the spec's tab panels within one render


def _json_to_yaml(text):
    """Convert JSON text to block-style YAML (keys kept in source order), or None
    if conversion is unavailable. pyyaml is provided by the spec renderer (uv,
    PEP 723) and the docs build (uvx --with pyyaml); if it is missing, or the
    text is not a full JSON document, callers fall back to a plain JSON block."""
    try:
        import yaml  # noqa: PLC0415 - optional; imported lazily so macros load without it
    except Exception:
        return None
    try:
        data = json.loads(text)
    except Exception:
        return None
    return yaml.safe_dump(
        data, sort_keys=False, allow_unicode=True, default_flow_style=False, width=100
    ).rstrip("\n")


def _fence(lang, text):
    return f"```{lang}\n{text}\n```"


def _docs_tabs(json_text, yaml_text):
    """JSON + 'View as YAML' as pymdownx content tabs (fence + content indented
    under each tab marker)."""
    def blk(lang, text):
        return "\n".join(("    " + ln).rstrip() for ln in [f"```{lang}", *text.split("\n"), "```"])
    return f'=== "JSON"\n\n{blk("json", json_text)}\n\n=== "View as YAML"\n\n{blk("yaml", yaml_text)}'


def _spec_tabs(json_text, yaml_text):
    """JSON + 'View as YAML' as a small HTML tab widget for the ReSpec spec.

    The code stays in Markdown fences (blank-line separated from the container
    tags) so mistune still renders them as <pre><code> - keeping ReSpec syntax
    highlighting and staying out of reach of the RFC 2119 wrapper. Styled and
    toggled by the CSS/JS injected in scripts/render_spec.py."""
    _ex_counter[0] += 1
    n = _ex_counter[0]

    def panel(pid, lang, text, hidden):
        return f'<div class="ex-panel" id="{pid}" role="tabpanel"{" hidden" if hidden else ""}>\n\n{_fence(lang, text)}\n\n</div>'

    return (
        '<div class="ex-tabs">\n'
        '<div class="ex-tablist" role="tablist">'
        f'<button class="ex-tab" role="tab" aria-selected="true" data-panel="ex{n}j">JSON</button>'
        f'<button class="ex-tab" role="tab" aria-selected="false" data-panel="ex{n}y">View as YAML</button>'
        '</div>\n\n'
        f'{panel(f"ex{n}j", "json", json_text, False)}\n\n'
        f'{panel(f"ex{n}y", "yaml", yaml_text, True)}\n\n'
        '</div>'
    )


def _example_tabs(json_text):
    """Render JSON (main) + 'View as YAML' tabs, or a plain JSON block when YAML
    conversion is unavailable. Target-aware (docs vs spec)."""
    yaml_text = _json_to_yaml(json_text)
    if yaml_text is None:
        return _fence("json", json_text)
    return _spec_tabs(json_text, yaml_text) if TARGET == "spec" else _docs_tabs(json_text, yaml_text)


def inline_file(path, lang="auto"):
    """Inline any repo file. JSON content renders as JSON (main) + 'View as YAML'
    tabs; other languages stay a single fenced block.

    `path` is relative to the repo root (no hardcoded directory prefix). With
    lang="auto" the fence language is inferred from the file extension.
    """
    with open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        content = fh.read().rstrip("\n")
    if lang == "auto":
        lang = _LANG_BY_EXT.get(os.path.splitext(path)[1].lower(), "")
    return _example_tabs(content) if lang == "json" else _fence(lang, content)


def example(name, lang="json"):
    """Inline an example schema (examples/<name>.schema.json) as JSON/YAML tabs."""
    return inline_file(f"examples/{name}.schema.json", lang)


def _rows(properties, prefix):
    """(keyword, description) rows for properties whose name starts with prefix."""
    rows = []
    for name, defn in (properties or {}).items():
        if name.startswith(prefix):
            desc = " ".join((defn.get("description") or "").split()).replace("|", "\\|")
            rows.append((name, desc))
    return rows


def _keyword_table(rows):
    lines = ["| Keyword | Description |", "| --- | --- |"]
    lines += [f"| `{name}` | {desc} |" for name, desc in rows]
    return "\n".join(lines)


def _keyword_properties(schema):
    """Keyword definitions of a schema: top-level `properties` plus any
    `$defs/<name>/properties`. The UI meta-schema keeps its keywords under
    $defs.keywords so the core schema can $ref just them, so a plain top-level
    scan would miss them."""
    props = dict(schema.get("properties") or {})
    for defn in (schema.get("$defs") or {}).values():
        if isinstance(defn, dict):
            props.update(defn.get("properties") or {})
    return props


def render_schema(path, prefix="x-"):
    """Render the extension-keyword table for one schema file (repo-relative).

    Collects keywords from the top-level `properties` and from
    `$defs/*/properties`, keeping those whose name starts with `prefix`
    (default "x-", so x-oold-*, x-oold-ui-*, x-enum-*, ... are all included).
    """
    with open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        schema = json.load(fh)
    return _keyword_table(_rows(_keyword_properties(schema), prefix))


def vocabulary():
    """Render the core x-oold-* keyword table from every meta/*.json top-level
    `properties` (single source). Dialect keywords kept under $defs (e.g. the UI
    meta-schema's x-oold-ui-*) get their own section via render_schema, so they
    are not duplicated here."""
    meta_dir = os.path.join(ROOT, "meta")
    rows = []
    for fname in sorted(os.listdir(meta_dir)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(meta_dir, fname), encoding="utf-8") as fh:
            rows += _rows(json.load(fh).get("properties"), "x-oold-")
    return _keyword_table(rows)


# Macros reused across the project; the /spec renderer registers the same set.
SHARED_MACROS = [example, inline_file, render_schema, vocabulary]


def define_env(env):
    """Entry point for zensical's macros extension."""
    for macro in SHARED_MACROS:
        env.macro(macro)
