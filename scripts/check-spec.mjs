// Structural lint for the generated ReSpec spec (docs/spec/index.html). Catches
// broken cross-references, unknown term refs, and unresolved bibliography refs
// that would otherwise only surface (if at all) when ReSpec renders in a browser.
// Fast, no browser required. Run after build:spec.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as config from "./spec.config.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "docs", "spec", "index.html"), "utf8");

// ReSpec resolves these bibliography keys from its built-in database; anything
// else must be declared in localBiblio.
const KNOWN_BIBLIO = new Set(["RFC2119", "RFC7386", "JSON-LD11"]);

const errors = [];

// 1. Every internal href="#id" resolves to an existing id.
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const m of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(m[1])) errors.push(`broken cross-reference: #${m[1]}`);
}

// 2. Every [=term=] reference matches a defined data-lt alias (from <dfn> or config).
const aliases = new Set();
for (const m of html.matchAll(/data-lt="([^"]+)"/g)) {
  for (const a of m[1].split("|")) aliases.add(a.toLowerCase().trim());
}
for (const m of html.matchAll(/\[=([^\]]+)=\]/g)) {
  const ref = m[1].split("|")[0].toLowerCase().trim();
  if (!aliases.has(ref)) errors.push(`undefined term reference: [=${m[1]}=]`);
}

// 3. Every [[REF]] is in localBiblio or a known ReSpec key.
const localBiblio = new Set(Object.keys(config.respec.localBiblio || {}));
for (const m of html.matchAll(/\[\[!?([A-Za-z0-9-]+)\]\]/g)) {
  const key = m[1];
  if (!localBiblio.has(key) && !KNOWN_BIBLIO.has(key)) {
    errors.push(`unknown bibliography reference: [[${key}]] (add to localBiblio or KNOWN_BIBLIO)`);
  }
}

// 4. Section-id set matches the expected list (guards accidental renames that
//    would break external deep links). Sorted for a stable diff.
const EXPECTED_IDS = [
  "abstract", "basic-concepts", "compatibility", "composition", "conformance",
  "design-goals", "expressiveness", "extensions", "iana", "identification",
  "identification-versioning", "identity", "index", "interoperability",
  "introduction", "jsonld-extensions", "jsonschema-extensions",
  "merge-and-override-model", "merging-remote-contexts", "meta-schema",
  "multi-mapping", "multilanguage", "ontology-class-iri", "processing-mode",
  "range-of-properties", "referencing-schema", "reverse-properties",
  "schema-instances", "security", "semantic-type", "sotd", "terminology",
  "ui-generation", "versioning", "why-x-oold-ref",
];
const sectionIds = [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]).sort();
const missing = EXPECTED_IDS.filter((id) => !sectionIds.includes(id));
const extra = sectionIds.filter((id) => !EXPECTED_IDS.includes(id));
if (missing.length) errors.push(`missing expected section ids: ${missing.join(", ")}`);
if (extra.length) errors.push(`unexpected section ids: ${extra.join(", ")} (update EXPECTED_IDS if intentional)`);

if (errors.length) {
  console.error("spec check FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`spec check OK (${sectionIds.length} sections, ${aliases.size} term aliases)`);
