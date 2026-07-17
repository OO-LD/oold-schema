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

console.log(`\n${total - failures}/${total} checks passed (${schemaFiles.length} schemas, ${instanceFiles.length} instances)`);
process.exit(failures ? 1 : 0);
