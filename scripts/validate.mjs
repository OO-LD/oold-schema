// Validates the OO-LD example schemas and instances, fully offline:
//   1. the meta-schema is valid against JSON-Schema 2020-12 (ajv validates it on compile);
//   2. each example schema is a well-formed OO-LD schema (validated against the meta-schema);
//   3. each schema's standard $ref composition resolves from disk (json-schema-ref-parser);
//   4. each committed instance (examples/*.instance.json) validates against its schema, with
//      formats enforced (ajv-formats + ajv-formats-draft2019 for iri/iri-reference/idn-*);
//   5. JSON-LD processing: every schema works as a remote @context (a dummy document is
//      expanded, exercising its term definitions) and every instance converts to RDF using
//      its schema as a remote context. A custom loader maps synthetic URLs to the local
//      example files and refuses network fetches, so the whole check is deterministic. The
//      examples use relative $ids, so the relative @context references that resolve on disk
//      also resolve here against BASE.
// x-oold-ref / x-oold-range are intentionally NOT auto-resolved; OO-LD-aware tooling does that.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import addFormats2019 from "ajv-formats-draft2019";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import jsonld from "jsonld";
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

// Compile a dereferenced example schema into a plain instance-validator. The custom $schema
// (the OO-LD meta URL) is dropped so ajv uses the 2020-12 dialect; x-oold-* keywords are
// unknown to ajv and ignored (strict:false), which is the intended validator/UI split.
async function instanceValidator(schemaFile) {
  const deref = await $RefParser.dereference(join(exDir, schemaFile));
  delete deref.$schema;
  const iajv = new Ajv2020({ strict: false, validateFormats: true });
  addFormats(iajv);
  addFormats2019(iajv);
  return iajv.compile(deref);
}

// JSON-LD document loader: map BASE + <file> to the local example file; refuse the network.
const BASE = "https://oo-ld.test/examples/";
jsonld.documentLoader = async (url) => {
  if (url.startsWith(BASE)) {
    return { contextUrl: null, documentUrl: url, document: JSON.parse(readFileSync(join(exDir, url.slice(BASE.length)), "utf8")) };
  }
  throw new Error(`refusing network fetch: ${url}`);
};

let failures = 0;
const fail = (msg) => { failures++; console.error(msg); };

console.log("Schemas (meta-schema + $ref composition):");
for (const f of schemaFiles) {
  const schema = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  if (!validateAsOOLD(schema)) { fail(`INVALID    ${f} (meta-schema): ` + JSON.stringify(validateAsOOLD.errors)); continue; }
  try { await $RefParser.dereference(join(exDir, f)); console.log(`OK         ${f}`); }
  catch (e) { fail(`UNRESOLVED ${f}: ${e.message}`); }
}

console.log("\nInstances (schema + formats):");
for (const f of instanceFiles) {
  const inst = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  try {
    const validate = await instanceValidator(inst.$schema);
    if (validate(inst)) console.log(`OK         ${f} (instance of ${inst.$schema})`);
    else fail(`INVALID    ${f}: ` + JSON.stringify(validate.errors));
  } catch (e) { fail(`ERROR      ${f}: ${e.message}`); }
}

console.log("\nJSON-LD - schemas as remote context (dummy document):");
for (const f of schemaFiles) {
  try { await jsonld.expand({ "@context": BASE + f, "@id": "https://example.org/dummy" }, { base: BASE }); console.log(`OK         ${f}`); }
  catch (e) { fail(`FAIL       ${f}: ${e.message}`); }
}

console.log("\nJSON-LD - instances to RDF (schema as remote context):");
for (const f of instanceFiles) {
  try {
    const nquads = await jsonld.toRDF(JSON.parse(readFileSync(join(exDir, f), "utf8")), { base: BASE + f, format: "application/n-quads" });
    const triples = nquads.split("\n").filter((l) => l.trim()).length;
    if (!triples) throw new Error("produced no triples");
    console.log(`OK         ${f} -> ${triples} triples`);
  } catch (e) { fail(`FAIL       ${f}: ${e.message}`); }
}

const total = schemaFiles.length * 2 + instanceFiles.length * 2;
console.log(`\n${total - failures}/${total} checks passed (${schemaFiles.length} schemas, ${instanceFiles.length} instances)`);
process.exit(failures ? 1 : 0);
