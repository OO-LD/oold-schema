// Validates the OO-LD example schemas, offline and with no hardcoded reference list:
//   1. the meta-schema is valid against JSON-Schema 2020-12 (ajv validates it on compile),
//   2. each example is a well-formed OO-LD schema (validated against the meta-schema),
//   3. each example's standard $ref composition resolves. Because the examples use a
//      relative $id, the base URI is the retrieval location (the file path locally, the
//      URL once deployed), so the same relative $ref resolves in both places. We resolve
//      from disk with json-schema-ref-parser.
// x-oold-ref / x-oold-range and @context references are intentionally NOT auto-resolved;
// they are handled by OO-LD-aware tooling.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const meta = JSON.parse(readFileSync(join(root, "meta", "oold-meta-schema.json"), "utf8"));
const uiMeta = JSON.parse(readFileSync(join(root, "meta", "oold-ui-meta-schema.json"), "utf8"));
const exDir = join(root, "examples");
const files = readdirSync(exDir).filter((f) => f.endsWith(".schema.json"));

// validateFormats: true (ajv default) + ajv-formats turns `format` into an
// assertion, so uri/uri-reference/uuid/date-time in the examples and meta-schemas
// are actually checked rather than annotated-and-ignored.
const ajv = new Ajv2020({ strict: false, validateFormats: true });
addFormats(ajv);
ajv.addSchema(uiMeta); // so the core meta-schema can $ref the UI keyword definitions
const validateAsOOLD = ajv.compile(meta); // also validates the meta-schema against 2020-12

let failures = 0;
for (const f of files) {
  const path = join(exDir, f);
  const schema = JSON.parse(readFileSync(path, "utf8"));
  if (!validateAsOOLD(schema)) {
    failures++;
    console.error(`INVALID    ${f} (meta-schema): ` + JSON.stringify(validateAsOOLD.errors));
    continue;
  }
  try {
    await $RefParser.dereference(path);
    console.log(`OK         ${f}`);
  } catch (e) {
    failures++;
    console.error(`UNRESOLVED ${f}: ${e.message}`);
  }
}
console.log(`\n${files.length - failures}/${files.length} example schemas valid`);
process.exit(failures ? 1 : 0);
