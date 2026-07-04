// Generates the ReSpec normative specification docs/spec/index.html from the
// Markdown source in spec/. The Markdown is the single source of truth; the
// HTML is a committed build artifact (see the DO NOT EDIT banner it carries).
//
// It also projects the x-oold-* keyword table from meta/*.json into
// spec/generated/vocabulary.md, which both this spec (via --8<--) and the guide
// (docs/guide/meta-schema.md, via zensical) include - so the vocabulary table
// never drifts from the meta-schema and is not a second source to maintain.
//
// Authoring conventions (see spec/ and the project docs):
//   ## Title {#id .class}            -> nested <section id class><h2>Title</h2>
//   MUST / SHOULD / MAY ...          -> <em class="rfc2119">…</em> (normative sections only)
//   [[JSONSCHEMA]] / [=term=]        -> passed through verbatim for ReSpec to resolve
//   :dfn[label]{lt="a|b"}            -> <dfn data-lt="a|b">label</dfn>
//   [](#id)                          -> <a href="#id"></a> (ReSpec auto-titles it)
//   :::example{title="…"} … :::      -> <aside class="example" title="…">…</aside>
//   :::note{title="…"} … :::         -> <div class="note" title="…">…</div>
//   GFM tables                       -> <table class="def">…</table>
// The #terminology <dl> and #index appendix are generated from spec.config.mjs.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString as mdToString } from "mdast-util-to-string";
import * as config from "./spec.config.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "spec", "sections");
const outFile = join(root, "docs", "spec", "index.html");

const RFC2119 = /\b(MUST NOT|MUST|SHALL NOT|SHALL|SHOULD NOT|SHOULD|REQUIRED|RECOMMENDED|MAY|OPTIONAL)\b/g;

// --- remark plugins -------------------------------------------------------

// Map inline / container directives to their ReSpec HTML equivalents.
function remarkDirectiveHandlers() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === "textDirective" && node.name === "dfn") {
        const lt = node.attributes?.lt || mdToString(node);
        node.data = { hName: "dfn", hProperties: { "data-lt": lt } };
      } else if (node.type === "containerDirective" && node.name === "example") {
        node.data = {
          hName: "aside",
          hProperties: { className: ["example"], title: node.attributes?.title },
        };
      } else if (node.type === "containerDirective" && node.name === "note") {
        node.data = {
          hName: "div",
          hProperties: { className: ["note"], title: node.attributes?.title },
        };
      }
    });
  };
}

// Parse a trailing `{#id .class}` off each heading and stash it on the node.
function remarkHeadingAttrs() {
  return (tree) => {
    visit(tree, "heading", (node) => {
      const last = node.children[node.children.length - 1];
      if (!last || last.type !== "text") return;
      const m = last.value.match(/\s*\{([^}]*)\}\s*$/);
      if (!m) return;
      last.value = last.value.slice(0, m.index).replace(/\s+$/, "");
      const attrs = { id: undefined, classes: [] };
      for (const tok of m[1].trim().split(/\s+/)) {
        if (tok.startsWith("#")) attrs.id = tok.slice(1);
        else if (tok.startsWith(".")) attrs.classes.push(tok.slice(1));
      }
      node.data = { ...(node.data || {}), sectionAttrs: attrs };
    });
  };
}

// Turn a flat list of blocks into nested <section> elements keyed off heading
// depth. When `headingless` the whole file becomes one <section id>.
function remarkSectionize({ headingless, id, className } = {}) {
  return (tree) => {
    if (headingless) {
      tree.children = [
        {
          type: "section",
          data: { hName: "section", hProperties: sectionProps(id, className) },
          children: tree.children,
        },
      ];
      return;
    }
    const root = { children: [] };
    const stack = []; // { depth, node }
    for (const block of tree.children) {
      if (block.type === "heading") {
        while (stack.length && stack[stack.length - 1].depth >= block.depth) stack.pop();
        const attrs = block.data?.sectionAttrs || {};
        const section = {
          type: "section",
          data: { hName: "section", hProperties: sectionProps(attrs.id, (attrs.classes || []).join(" ") || undefined) },
          children: [block],
        };
        const parent = stack.length ? stack[stack.length - 1].node : root;
        parent.children.push(section);
        stack.push({ depth: block.depth, node: section });
      } else {
        const target = stack.length ? stack[stack.length - 1].node : root;
        target.children.push(block);
      }
    }
    tree.children = root.children;
  };
}

function sectionProps(id, className) {
  const props = {};
  if (id) props.id = id;
  if (className) props.className = className.split(/\s+/);
  return props;
}

// Wrap RFC 2119 keywords, skipping code and informative/appendix sections.
function remarkRfc2119() {
  return (tree) => walkRfc(tree, false);
}

function isInformative(node) {
  const cls = node.data?.hProperties?.className || [];
  const id = node.data?.hProperties?.id;
  return cls.includes("informative") || id === "index" || id === "introduction";
}

function walkRfc(node, informative) {
  if (!node.children) return;
  const inf = informative || (node.type === "section" && isInformative(node));
  const out = [];
  for (const child of node.children) {
    if (child.type === "text" && !inf) {
      out.push(...splitKeywords(child.value));
    } else {
      if (child.type !== "inlineCode" && child.type !== "code") walkRfc(child, inf);
      out.push(child);
    }
  }
  node.children = out;
}

function splitKeywords(value) {
  const nodes = [];
  let last = 0;
  let m;
  RFC2119.lastIndex = 0;
  while ((m = RFC2119.exec(value)) !== null) {
    if (m.index > last) nodes.push({ type: "text", value: value.slice(last, m.index) });
    nodes.push({
      type: "rfc2119",
      data: { hName: "em", hProperties: { className: ["rfc2119"] } },
      children: [{ type: "text", value: m[0] }],
    });
    last = m.index + m[0].length;
  }
  if (last < value.length) nodes.push({ type: "text", value: value.slice(last) });
  return nodes.length ? nodes : [{ type: "text", value }];
}

// Tag GFM tables as ReSpec definition tables.
function remarkTableClass() {
  return (tree) => {
    visit(tree, "table", (node) => {
      node.data = { ...(node.data || {}), hProperties: { className: ["def"] } };
    });
  };
}

// --- rendering ------------------------------------------------------------

export function processor(sectionOpts) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkDirectiveHandlers)
    .use(remarkHeadingAttrs)
    .use(remarkSectionize, sectionOpts)
    .use(remarkRfc2119)
    .use(remarkTableClass)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true, closeSelfClosing: true });
}

// Inline `--8<-- "path"` includes (pymdownx.snippets syntax), resolved from the
// repo root, so example files in examples/ are a single source shared with the
// zensical guide. Paths match zensical's snippets base_path (".").
const SNIPPET = /^([ \t]*)--8<--[ \t]+"([^"]+)"[ \t]*$/gm;
function expandSnippets(md) {
  return md.replace(SNIPPET, (_m, indent, rel) => {
    const content = readFileSync(join(root, rel), "utf8")
      // Drop a leading "generated" banner comment so it doesn't land in the spec.
      .replace(/^<!--[\s\S]*?-->\s*/, "")
      .replace(/\n+$/, "");
    return content
      .split("\n")
      .map((line) => indent + line)
      .join("\n");
  });
}

function renderFile(entry) {
  const md = expandSnippets(readFileSync(join(srcDir, entry.file), "utf8"));
  return String(
    processor({ headingless: !!entry.headingless, id: entry.id }).processSync(md),
  );
}

// Render a short Markdown snippet to inline HTML (strips the wrapping <p>).
function renderInline(md) {
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(md),
  ).trim();
  return html.replace(/^<p>/, "").replace(/<\/p>$/, "");
}

function renderTerminology() {
  const items = config.terminology
    .map(
      (t) =>
        `  <dt><dfn data-lt="${t.lt}">${t.term}</dfn></dt>\n` +
        `  <dd>${renderInline(t.def)}</dd>`,
    )
    .join("\n");
  return (
    `<section id="terminology">\n` +
    `  <h2>Terminology</h2>\n` +
    `  <p>The following terms are used throughout this specification:</p>\n` +
    `  <dl>\n${items}\n  </dl>\n` +
    `</section>`
  );
}

function renderIndex() {
  const refs = config.indexTerms.map((r) => `[=${r}=]`).join(", ");
  return (
    `<section id="index" class="appendix">\n` +
    `  <h2>Index of Terms</h2>\n` +
    `  <p>The following defined terms are used in this specification: ${refs}.</p>\n` +
    `</section>`
  );
}

function renderHead() {
  const respec = JSON.stringify(config.respec, null, 2);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OO-LD Schema</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://www.w3.org/Tools/respec/respec-w3c" class="remove" defer></script>
  <script class="remove">
    // ReSpec configuration. See https://respec.org/docs/ for all options.
    var respecConfig = ${respec};
  </script>
</head>
<body>`;
}

const metaDir = join(root, "meta");
const vocabFile = join(root, "spec", "generated", "vocabulary.md");

// Project the x-oold-* keywords (name + description, and examples when present)
// from every meta/*.json into a single Markdown table partial. Colons are
// emitted as "&#58;" so tokens like `rdf:type` are not misread as text
// directives when this partial is inlined into the remark pipeline; the guide
// (python-markdown) renders it the same. The result is a pure projection of the
// meta-schemas - the descriptions are the single source of truth.
function buildVocabulary() {
  const files = readdirSync(metaDir).filter((f) => f.endsWith(".json")).sort();
  const rows = [];
  for (const file of files) {
    const schema = JSON.parse(readFileSync(join(metaDir, file), "utf8"));
    for (const [name, def] of Object.entries(schema.properties || {})) {
      if (name.startsWith("x-oold-")) rows.push({ name, description: def.description || "", examples: def.examples });
    }
  }
  const clean = (s) => String(s).replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ").trim();
  const hasExamples = rows.some((r) => Array.isArray(r.examples) && r.examples.length);
  const cols = ["Keyword", "Description", ...(hasExamples ? ["Example"] : [])];
  const lines = [`| ${cols.join(" | ")} |`, `| ${cols.map(() => "---").join(" | ")} |`];
  for (const r of rows) {
    const cells = ["`" + r.name + "`", clean(r.description).replace(/:(?=[A-Za-z])/g, "&#58;")];
    if (hasExamples) cells.push(r.examples?.length ? "`" + clean(JSON.stringify(r.examples[0])).replace(/`/g, "") + "`" : "");
    lines.push(`| ${cells.join(" | ")} |`);
  }
  mkdirSync(dirname(vocabFile), { recursive: true });
  writeFileSync(vocabFile, lines.join("\n") + "\n");
}

function build() {
  buildVocabulary();
  const banner =
    "<!-- DO NOT EDIT - generated by scripts/build-spec.mjs from spec/. Edit the Markdown source and run `npm run build:spec`. -->";
  const body = config.sections
    .map((entry) => {
      if (entry.generate === "terminology") return renderTerminology();
      if (entry.generate === "index") return renderIndex();
      return renderFile(entry);
    })
    .join("\n\n")
    // Collapse the runs of blank lines the rehype pipeline leaves between block
    // elements (esp. around tables); purely cosmetic whitespace between tags.
    .replace(/\n{3,}/g, "\n\n");
  const html = `${renderHead().replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${banner}`)}\n\n${body}\n\n</body>\n</html>\n`;
  writeFileSync(outFile, html);
  console.log(`Wrote ${outFile} (${config.sections.length} sections)`);
}

if (process.argv[1] && /build-spec\.mjs$/.test(process.argv[1])) build();
