// Validates the OO-LD example schemas and instances, fully offline:
//   1. the meta-schema is valid against JSON-Schema 2020-12 (ajv validates it on compile);
//   2. each example schema is a well-formed OO-LD schema (validated against the meta-schema)
//      and its standard $ref composition resolves from disk (json-schema-ref-parser);
//   3. each committed instance (examples/*.instance.json) validates against its schema, with
//      formats enforced (ajv-formats + ajv-formats-draft2019 for iri/iri-reference/idn-*);
//   4. an instance auto-generated from each schema (json-schema-faker, all optionals, formats
//      respected) validates against that schema - a satisfiability / generator sanity check;
//   5. JSON-LD: every schema works as a remote @context (a dummy document is expanded,
//      exercising its term definitions); and every committed instance round-trips
//      instance -> RDF -> instance losslessly (proving the @context maps every property, so
//      nothing is dropped through RDF). A custom loader maps synthetic URLs to the local
//      example files and refuses network fetches, so the whole check is deterministic. The
//      examples use relative $ids, so the relative @context references that resolve on disk
//      also resolve here against BASE.
// x-oold-ref / x-oold-range are intentionally NOT auto-resolved; OO-LD-aware tooling does that.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import addFormats2019 from "ajv-formats-draft2019";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import jsonld from "jsonld";
import { createGenerator } from "json-schema-faker";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const exDir = join(root, "examples");
const meta = JSON.parse(readFileSync(join(root, "meta", "oold-meta-schema.json"), "utf8"));
const uiMeta = JSON.parse(readFileSync(join(root, "meta", "oold-ui-meta-schema.json"), "utf8"));
const schemaFiles = readdirSync(exDir).filter((f) => f.endsWith(".schema.json"));
const instanceFiles = readdirSync(exDir).filter((f) => f.endsWith(".instance.json"));

// validateFormats: true + ajv-formats (uri, uuid, date-time, ...) + ajv-formats-draft2019
// (iri, iri-reference, idn-*) turn `format` into a real assertion instead of an annotation.
const ajv = new Ajv2020({ strict: false, validateFormats: true });
addFormats(ajv);
addFormats2019(ajv);
ajv.addSchema(uiMeta); // so the core meta-schema can $ref the UI keyword definitions
const validateAsOOLD = ajv.compile(meta); // also validates the meta-schema against 2020-12

// json-schema-faker respects declared string formats (it emits a valid uri/iri/email/...),
// so generated instances are validated with formats on, matching the committed instances.
const jsfGen = createGenerator({ alwaysFakeOptionals: true, useExamplesValue: true, useDefaultValue: true });

// Compile a dereferenced example schema into a plain instance-validator. The custom $schema
// (the OO-LD meta URL) is dropped so ajv uses the 2020-12 dialect; x-oold-* keywords are
// unknown to ajv and ignored (strict:false), which is the intended validator/UI split.
const derefCache = {};
async function dereffed(schemaFile) {
  if (!derefCache[schemaFile]) {
    const d = await $RefParser.dereference(join(exDir, schemaFile));
    delete d.$schema;
    derefCache[schemaFile] = d;
  }
  return derefCache[schemaFile];
}
function compileValidator(schema) {
  const iajv = new Ajv2020({ strict: false, validateFormats: true });
  addFormats(iajv);
  addFormats2019(iajv);
  return iajv.compile(schema);
}

// JSON-LD document loader: map BASE + <file> to the local example file; refuse the network.
const BASE = "https://oo-ld.test/examples/";
jsonld.documentLoader = async (url) => {
  if (url.startsWith(BASE)) {
    return { contextUrl: null, documentUrl: url, document: JSON.parse(readFileSync(join(exDir, url.slice(BASE.length)), "utf8")) };
  }
  throw new Error(`refusing network fetch: ${url}`);
};

// Canonical form for the roundtrip compare: drop @context/$schema, and treat a single value
// and a one-element array alike (JSON-LD compaction collapses single-element arrays).
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v).sort()) {
      if (k === "@context" || k === "$schema") continue;
      o[k] = canonical([].concat(v[k]));
    }
    return o;
  }
  return v;
}

// Enumerate one schema variant per oneOf/anyOf branch by pinning that branch to a
// single-element array. json-schema-faker only picks a branch at random, so pinning is
// how we get deterministic, exhaustive per-branch coverage.
function collectVariants(schema) {
  const variants = [];
  const SUB_DICT = ["properties", "$defs", "definitions", "patternProperties"];
  const SUB_VAL = ["items", "additionalProperties", "not", "if", "then", "else", "contains", "propertyNames"];
  const SUB_LIST = ["allOf", "oneOf", "anyOf", "prefixItems"];
  function walk(node, path) {
    if (!node || typeof node !== "object") return;
    for (const kw of ["oneOf", "anyOf"]) {
      if (Array.isArray(node[kw]) && node[kw].length > 1) {
        node[kw].forEach((_, i) => {
          const clone = structuredClone(schema);
          let target = clone;
          for (const k of path) target = target[k];
          target[kw] = [structuredClone(node[kw][i])];
          variants.push({ label: `${path.join("/") || "<root>"}/${kw}[${i}]`, schema: clone });
        });
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (!v || typeof v !== "object") continue;
      if (SUB_DICT.includes(k)) for (const [pk, pv] of Object.entries(v)) walk(pv, [...path, k, pk]);
      else if (SUB_VAL.includes(k)) walk(v, [...path, k]);
      else if (SUB_LIST.includes(k) && Array.isArray(v)) v.forEach((sv, i) => walk(sv, [...path, k, i]));
    }
  }
  walk(schema, []);
  return variants;
}

// Collect every x-oold-* / x-enum-* keyword name used anywhere in a schema (for the
// vocab-coverage cross-check against the meta-schemas).
function collectKeywords(node, set) {
  if (Array.isArray(node)) { for (const x of node) collectKeywords(x, set); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("x-oold-") || k.startsWith("x-enum-")) set.add(k);
      collectKeywords(v, set);
    }
  }
}

let total = 0;
let failures = 0;
const ok = (m) => { total++; console.log(`OK         ${m}`); };
const bad = (m) => { total++; failures++; console.error(m); };

console.log("Schemas (meta-schema + $ref composition):");
for (const f of schemaFiles) {
  const schema = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  if (!validateAsOOLD(schema)) { bad(`INVALID    ${f} (meta-schema): ` + JSON.stringify(validateAsOOLD.errors)); continue; }
  try { await $RefParser.dereference(join(exDir, f)); ok(f); }
  catch (e) { bad(`UNRESOLVED ${f}: ${e.message}`); }
}

console.log("\nCommitted instances (schema + formats):");
for (const f of instanceFiles) {
  const inst = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  try {
    const validate = compileValidator(await dereffed(inst.$schema));
    if (validate(inst)) ok(`${f} (instance of ${inst.$schema})`);
    else bad(`INVALID    ${f}: ` + JSON.stringify(validate.errors));
  } catch (e) { bad(`ERROR      ${f}: ${e.message}`); }
}

console.log("\nAuto-generated instances (satisfiability, formats respected):");
for (const f of schemaFiles) {
  try {
    const schema = await dereffed(f);
    let sample = jsfGen.generate(schema);
    if (sample && typeof sample.then === "function") sample = await sample;
    const validate = compileValidator(schema);
    if (validate(sample)) ok(`${f}`);
    else bad(`GEN-INVALID ${f}: ` + JSON.stringify(validate.errors) + ` sample=${JSON.stringify(sample)}`);
  } catch (e) { bad(`GEN-ERROR  ${f}: ${e.message}`); }
}

console.log("\nJSON-LD - schemas as remote context (dummy document):");
for (const f of schemaFiles) {
  try { await jsonld.expand({ "@context": BASE + f, "@id": "https://example.org/dummy" }, { base: BASE }); ok(f); }
  catch (e) { bad(`FAIL       ${f}: ${e.message}`); }
}

console.log("\nJSON-LD - instance roundtrip (instance -> RDF -> instance):");
for (const f of instanceFiles) {
  const inst = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  try {
    const nquads = await jsonld.toRDF(inst, { base: BASE + f, format: "application/n-quads" });
    const triples = nquads.split("\n").filter((l) => l.trim()).length;
    if (!triples) throw new Error("produced no triples");
    const back = await jsonld.fromRDF(nquads, { format: "application/n-quads" });
    const restored = await jsonld.compact(back, BASE + inst.$schema, { base: BASE + f });
    if (JSON.stringify(canonical(inst)) === JSON.stringify(canonical(restored))) {
      ok(`${f} -> ${triples} triples, lossless`);
    } else {
      bad(`LOSSY      ${f}: instance != roundtrip (incomplete @context?)\n  in:  ${JSON.stringify(canonical(inst))}\n  out: ${JSON.stringify(canonical(restored))}`);
    }
  } catch (e) { bad(`FAIL       ${f}: ${e.message}`); }
}

console.log("\nVariant coverage (auto-generate per oneOf/anyOf branch):");
let variantChecks = 0;
for (const f of schemaFiles) {
  const schema = await dereffed(f);
  const variants = collectVariants(schema);
  if (!variants.length) continue;
  const validate = compileValidator(schema);
  for (const v of variants) {
    variantChecks++;
    try {
      let sample = jsfGen.generate(v.schema);
      if (sample && typeof sample.then === "function") sample = await sample;
      if (validate(sample)) ok(`${f} ${v.label}`);
      else bad(`VARIANT    ${f} ${v.label}: generated instance rejected: ` + JSON.stringify(validate.errors));
    } catch (e) { bad(`VARIANT    ${f} ${v.label}: ${e.message}`); }
  }
}
if (!variantChecks) console.log("(no oneOf/anyOf branches in the example schemas)");

// ---- Tier 2: deterministic per-feature suites (examples/compliance/) --------------------
const complianceDir = join(exDir, "compliance");
const complianceFiles = (() => { try { return readdirSync(complianceDir).filter((f) => f.endsWith(".json")); } catch { return []; } })();
const RDF_BASE = "https://oo-ld.test/";
const coveredKeywords = new Set();

console.log("\nCompliance suite (deterministic, per feature):");
for (const file of complianceFiles) {
  const groups = JSON.parse(readFileSync(join(complianceDir, file), "utf8"));
  for (const group of groups) {
    const label = group.feature || group.description || file;
    if (Array.isArray(group.schemas)) {
      // vocab well-formedness: each candidate schema is checked against the OO-LD meta-schema
      for (const c of group.schemas) {
        collectKeywords(c.schema, coveredKeywords);
        const result = validateAsOOLD(c.schema);
        if (result === c.valid) ok(`${file} :: ${c.description}`);
        else bad(`WRONG      ${file} :: ${c.description} (expected schema ${c.valid ? "valid" : "invalid"}, got ${result ? "valid" : "invalid"})` + (result ? "" : ": " + JSON.stringify(validateAsOOLD.errors)));
      }
    } else if (Array.isArray(group.tests)) {
      // per-feature: validation (valid) + JSON-LD RDF (expectRdf) + negative (expectErrorCode).
      // A group names its schema either by `schemaRef` (an example file, so real OO-LD
      // composition - base-class context inheritance, property-$ref scoped context - is
      // exercised via the loader) or inline via `schema`.
      let validate, ctx = null, rdfBase = RDF_BASE;
      try {
        if (group.schemaRef) { validate = compileValidator(await dereffed(group.schemaRef)); rdfBase = BASE; }
        else {
          if (!validateAsOOLD(group.schema)) { bad(`INVALID    feature schema ${file} :: ${label}: ` + JSON.stringify(validateAsOOLD.errors)); continue; }
          const s = structuredClone(group.schema); delete s.$schema;
          validate = compileValidator(s); ctx = group.schema["@context"];
        }
      } catch (e) { bad(`COMPILE    ${file} :: ${label}: ${e.message}`); continue; }
      for (const t of group.tests) {
        if ("valid" in t) {
          const r = validate(t.data);
          if (r === t.valid) ok(`${file} :: ${label} :: ${t.description} [validate]`);
          else bad(`WRONG      ${file} :: ${label} :: ${t.description} [validate] (expected ${t.valid ? "pass" : "fail"}, got ${r ? "pass" : "fail"})` + (r ? "" : ": " + JSON.stringify(validate.errors)));
        }
        if ("expectRdf" in t) {
          try {
            const doc = t.data["@context"] ? { ...t.data } : { "@context": ctx, ...t.data };
            delete doc.$schema; // $schema is JSON Schema metadata, not JSON-LD data
            const got = await jsonld.canonize(doc, { base: rdfBase, algorithm: "URDNA2015", format: "application/n-quads" });
            const want = await jsonld.canonize(t.expectRdf, { inputFormat: "application/n-quads", algorithm: "URDNA2015", format: "application/n-quads" });
            if (got.trim() === want.trim()) ok(`${file} :: ${label} :: ${t.description} [rdf]`);
            else bad(`WRONG      ${file} :: ${label} :: ${t.description} [rdf] not isomorphic\n  got:  ${got.trim()}\n  want: ${want.trim()}`);
          } catch (e) { bad(`ERROR      ${file} :: ${label} :: ${t.description} [rdf]: ${e.message}`); }
        }
        if ("expectErrorCode" in t) {
          let err = null;
          try { await jsonld.toRDF(t.data, { base: rdfBase, format: "application/n-quads" }); }
          catch (e) { err = e; }
          const code = err && ((err.details && err.details.code) || err.message || "");
          if (err && (t.expectErrorCode === true || String(code).includes(t.expectErrorCode))) ok(`${file} :: ${label} :: ${t.description} [error]`);
          else if (err) bad(`WRONG      ${file} :: ${label} :: ${t.description} [error] threw "${code}", expected "${t.expectErrorCode}"`);
          else bad(`WRONG      ${file} :: ${label} :: ${t.description} [error] did not throw (expected "${t.expectErrorCode}")`);
        }
      }
    }
  }
}

// vocab coverage: every keyword defined in the meta-schemas must have a well-formedness test
console.log("\nVocab coverage (meta-schema keywords vs oold-vocab.json):");
const definedKeywords = [
  ...Object.keys(meta.properties).filter((k) => k.startsWith("x-oold-")),
  ...Object.keys(uiMeta.$defs.keywords.properties),
];
const uncovered = definedKeywords.filter((k) => !coveredKeywords.has(k));
if (!uncovered.length) ok(`all ${definedKeywords.length} x-oold-* / x-oold-ui-* keywords are covered`);
else bad(`UNCOVERED  ${uncovered.length} keyword(s) defined in the meta-schemas but not tested: ${uncovered.join(", ")}`);

console.log(`\n${total - failures}/${total} checks passed`);
process.exit(failures ? 1 : 0);
