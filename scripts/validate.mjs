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
import { schemaToFrame, embeddedProperties, instanceRdfTypes } from "./schema_to_frame.mjs";
import { arrayPropertiesMissingContainer, iriReferencesMissingFormat } from "./pattern_lint.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const exDir = join(root, "examples");
const meta = JSON.parse(readFileSync(join(root, "meta", "oold-meta-schema.json"), "utf8"));
const uiMeta = JSON.parse(readFileSync(join(root, "meta", "oold-ui-meta-schema.json"), "utf8"));
const patternLint = JSON.parse(readFileSync(join(root, "meta", "oold-pattern-lint.schema.json"), "utf8"));
const schemaFiles = readdirSync(exDir).filter((f) => f.endsWith(".schema.json"));
const instanceFiles = readdirSync(exDir).filter((f) => f.endsWith(".instance.json"));

// Corrected IRI formats (RFC 3987). ajv-formats-draft2019 ships buggy iri / iri-reference
// regexes: they reject valid compact IRIs such as `ex:alice` (which any URI/IRI grammar
// accepts - an IRI is a superset of a URI) and are mutually inconsistent (e.g. `iri` accepts
// `urn:uuid:...` but `iri-reference` does not). We override them so the pipeline matches the
// upstream RFCs the spec recommends: an IRI reference excludes ASCII controls, space and the
// delimiters RFC 3987 disallows (non-ASCII ucschar stays allowed); an absolute IRI
// additionally begins with a scheme. Bug reported upstream: luzlab/ajv-formats-draft2019#31.
const IRI_EXCLUDED = /[\s<>"{}|\\^`]/;
const isIriReference = (s) => typeof s === "string" && !IRI_EXCLUDED.test(s);
const isIri = (s) => isIriReference(s) && /^[A-Za-z][A-Za-z0-9+.\-]*:/.test(s);
function fixIriFormats(a) {
  a.addFormat("iri-reference", isIriReference);
  a.addFormat("iri", isIri);
}

// validateFormats: true + ajv-formats (uri, uuid, date-time, ...) + ajv-formats-draft2019
// (iri, iri-reference, idn-*) turn `format` into a real assertion instead of an annotation.
const ajv = new Ajv2020({ strict: false, validateFormats: true });
addFormats(ajv);
addFormats2019(ajv);
fixIriFormats(ajv);
ajv.addSchema(uiMeta); // so the core meta-schema can $ref the UI keyword definitions
const validateAsOOLD = ajv.compile(meta); // also validates the meta-schema against 2020-12
// SHOULD-level round-trip pattern lint over a schema's @context (no @type: xsd:string, ...).
const validatePatternLint = ajv.compile(patternLint);

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
  fixIriFormats(iajv);
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

// Canonical form for the roundtrip compare: drop @context/$schema, sort array members (RDF
// sets are unordered), and treat a single value and a one-element array alike. The last is
// JSON-LD-semantic equality, not laxness: `"x"` and `["x"]` expand identically, and
// compaction picks scalar (plain term) or array (@container @set) form, so cardinality may
// legitimately differ between an instance and its round-trip - e.g. a oneOf literal|array
// property whose scalar value returns as a one-element array under @set - without any loss.
// The @container @set/@list requirement is enforced separately and statically by the
// pattern lint, not by this compare.
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v).sort()) {
      if (k === "@context" || k === "$schema") continue;
      // Blank-node identifiers are arbitrary labels, not stable identity: a blank node
      // acquires a `_:bN` label on the way back from RDF that it did not carry before.
      // Drop @id when all its values are such labels so the node compares equal.
      if (k === "@id") {
        const vals = [].concat(v[k]);
        if (vals.every((x) => typeof x === "string" && x.startsWith("_:"))) continue;
      }
      o[k] = canonical([].concat(v[k]));
    }
    return o;
  }
  return v;
}

// Property keys present in `before` but missing from `after`, compared recursively and
// order-insensitively; leaf values are ignored. This is the keys-only counterpart of the
// canonical compare, for round-tripping generated instances: a property with no (or a
// broken) @context term drops out of RDF, so its key disappears from the reconstruction,
// while value coercion (e.g. a reference string resolving to an absolute IRI) keeps the
// key and so is not falsely reported.
function lostKeys(before, after, path = "", lost = []) {
  if (Array.isArray(before)) {
    const arr = Array.isArray(after) ? after : after == null ? [] : [after];
    for (const el of before) {
      if (el && typeof el === "object" && !arr.some((a) => lostKeys(el, a, path, []).length === 0)) lost.push(`${path}[]`);
    }
    return lost;
  }
  if (before && typeof before === "object") {
    const a = after && typeof after === "object" && !Array.isArray(after)
      ? after
      : Array.isArray(after) ? after.find((x) => x && typeof x === "object") || {} : {};
    for (const k of Object.keys(before)) {
      if (k === "@context" || k === "$schema") continue;
      const p = path ? `${path}.${k}` : k;
      if (!(k in a)) lost.push(p);
      else lostKeys(before[k], a[k], p, lost);
    }
  }
  return lost;
}

// Round-trip an instance as a compliant export: attach the remote @context, materialize
// the declared rdf:type(s) as @type (unless already carried), project to RDF and back, and
// reconstruct with compaction (or the schema-derived frame when the schema embeds objects).
// Returns the property keys lost on the way - empty means nothing was dropped.
async function roundtrip(schema, sample, ctxRef) {
  const doc = { "@context": ctxRef, ...sample };
  const types = instanceRdfTypes(schema);
  if (types && !("type" in sample) && !("@type" in sample)) doc["@type"] = types;
  const nquads = await jsonld.toRDF(doc, { base: ctxRef, format: "application/n-quads" });
  const back = await jsonld.fromRDF(nquads, { format: "application/n-quads" });
  const restored = embeddedProperties(schema).length
    ? await jsonld.frame(back, schemaToFrame(schema, ctxRef), { base: ctxRef, omitDefault: true })
    : await jsonld.compact(back, ctxRef, { base: ctxRef });
  return { lost: lostKeys(sample, restored), restored };
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
let warnings = 0;
const ok = (m) => { total++; console.log(`OK         ${m}`); };
const bad = (m) => { total++; failures++; console.error(m); };
const warn = (m) => { warnings++; console.warn(`WARN       ${m}`); };

console.log("Schemas (meta-schema + $ref composition):");
for (const f of schemaFiles) {
  const schema = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  if (!validateAsOOLD(schema)) { bad(`INVALID    ${f} (meta-schema): ` + JSON.stringify(validateAsOOLD.errors)); continue; }
  try { await $RefParser.dereference(join(exDir, f)); ok(f); }
  catch (e) { bad(`UNRESOLVED ${f}: ${e.message}`); }
}

console.log("\nPattern lint (round-trip-safe @context):");
for (const f of schemaFiles) {
  const schema = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  // MUST:
  //  - no @type: xsd:string on any term - it never round-trips (the value reappears under the
  //    full predicate IRI, so the term is lost). JSON-Schema-expressible (oold-pattern-lint).
  //  - a strictly `type: array` property must declare @container @set/@list, or a single-
  //    element array returns as a scalar and the reconstruction fails re-validation. This
  //    correlates `properties` with `@context`, so it is not JSON-Schema-expressible. (The
  //    post-round-trip re-validation is a backstop, but only fires when the generated sample
  //    happens to be a single-element array; this static check catches it unconditionally.)
  const lintOk = validatePatternLint(schema);
  const missingContainer = arrayPropertiesMissingContainer(schema);
  if (!lintOk) bad(`LINT       ${f}: ` + JSON.stringify(validatePatternLint.errors));
  else if (missingContainer.length) bad(`LINT       ${f}: strict array propert${missingContainer.length > 1 ? "ies" : "y"} without @container @set/@list: ${missingContainer.join(", ")}`);
  else ok(f);
  // SHOULD (lexical-form recommendation, not loss - a warning): a bare-IRI-string reference
  // should carry an IRI/URI-family format (iri-reference, or stricter uri*). Correlates
  // `properties` with `@context`, so not JSON-Schema-expressible.
  const missingFormat = iriReferencesMissingFormat(schema);
  if (missingFormat.length) warn(`${f}: IRI reference propert${missingFormat.length > 1 ? "ies" : "y"} without an iri-reference/uri* format: ${missingFormat.join(", ")}`);
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
const genSamples = {};
for (const f of schemaFiles) {
  try {
    const schema = await dereffed(f);
    let sample = jsfGen.generate(schema);
    if (sample && typeof sample.then === "function") sample = await sample;
    genSamples[f] = sample;
    const validate = compileValidator(schema);
    if (validate(sample)) ok(`${f}`);
    else bad(`GEN-INVALID ${f}: ` + JSON.stringify(validate.errors) + ` sample=${JSON.stringify(sample)}`);
  } catch (e) { bad(`GEN-ERROR  ${f}: ${e.message}`); }
}

// Round-trip each generated instance through RDF and report any property key it drops -
// a property with no (or a broken) @context term is silently lost through RDF, so its key
// is missing from the reconstruction. This assumes a valid schema maps all its properties.
// The reconstruction is also re-validated against the schema: if the @context does not
// preserve a property's shape (e.g. a `type: array` property without @container @set comes
// back as a scalar), the round-tripped instance no longer conforms - a round-trip validation
// error, distinct from information loss.
console.log("\nJSON-LD - generated instance roundtrip (no loss, reconstruction re-validates):");
for (const f of schemaFiles) {
  if (!(f in genSamples)) continue;
  try {
    const schema = await dereffed(f);
    const { lost, restored } = await roundtrip(schema, genSamples[f], BASE + f);
    if (lost.length) { bad(`RT-LOSSY   ${f}: propert${lost.length > 1 ? "ies" : "y"} lost through RDF (unmapped in @context?): ${lost.join(", ")}`); continue; }
    const validate = compileValidator(schema);
    if (validate(restored)) ok(`${f}`);
    else bad(`RT-INVALID ${f}: reconstruction fails its schema (shape not preserved by @context?): ` + JSON.stringify(validate.errors));
  } catch (e) { bad(`RT-ERROR   ${f}: ${e.message}`); }
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
    // Literals and references reconstruct by compaction; embedded (blank-node) objects
    // need framing, so when the schema embeds objects, reconstruct with the minimal
    // schema-derived frame (see scripts/schema_to_frame.mjs) instead of plain compaction.
    const schema = await dereffed(inst.$schema);
    let restored, how;
    if (embeddedProperties(schema).length) {
      restored = await jsonld.frame(back, schemaToFrame(schema, BASE + inst.$schema), { base: BASE + f, omitDefault: true });
      how = "framed";
    } else {
      restored = await jsonld.compact(back, BASE + inst.$schema, { base: BASE + f });
      how = "compacted";
    }
    if (JSON.stringify(canonical(inst)) === JSON.stringify(canonical(restored))) {
      ok(`${f} -> ${triples} triples, lossless (${how})`);
    } else {
      bad(`LOSSY      ${f}: instance != roundtrip (incomplete @context?)\n  in:  ${JSON.stringify(canonical(inst))}\n  out: ${JSON.stringify(canonical(restored))}`);
    }
  } catch (e) { bad(`FAIL       ${f}: ${e.message}`); }
}

// Each oneOf/anyOf branch is generated in isolation, validated, AND round-tripped through
// RDF (the @context is unchanged by branch pinning, so the base schema drives reconstruction).
// This is where the ambiguous-range branches - literal / reference / embedded object - each
// get their own round-trip loss check.
console.log("\nVariant coverage (auto-generate + roundtrip per oneOf/anyOf branch):");
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
      if (!validate(sample)) { bad(`VARIANT    ${f} ${v.label}: generated instance rejected: ` + JSON.stringify(validate.errors)); continue; }
      const { lost, restored } = await roundtrip(schema, sample, BASE + f);
      if (lost.length) bad(`VARIANT-RT ${f} ${v.label}: propert${lost.length > 1 ? "ies" : "y"} lost through RDF: ${lost.join(", ")}`);
      else if (!validate(restored)) bad(`VARIANT-RT ${f} ${v.label}: reconstruction fails its schema: ` + JSON.stringify(validate.errors));
      else ok(`${f} ${v.label}`);
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
    } else if (Array.isArray(group.lintSchemas)) {
      // round-trip pattern lint: each candidate @context is checked against the pattern-lint schema
      for (const c of group.lintSchemas) {
        const result = validatePatternLint(c.schema);
        if (result === c.valid) ok(`${file} :: ${c.description}`);
        else bad(`WRONG      ${file} :: ${c.description} (expected lint ${c.valid ? "pass" : "fail"}, got ${result ? "pass" : "fail"})` + (result ? "" : ": " + JSON.stringify(validatePatternLint.errors)));
      }
    } else if (Array.isArray(group.tests)) {
      // per-feature: validation (valid) + JSON-LD RDF (expectRdf) + negative (expectErrorCode).
      // A group names its schema either by `schemaRef` (an example file, so real OO-LD
      // composition - base-class context inheritance, property-$ref scoped context - is
      // exercised via the loader) or inline via `schema`.
      let validate, ctx = null, rdfBase = RDF_BASE, featureSchema = null, frameCtxRef = null;
      try {
        if (group.schemaRef) {
          featureSchema = await dereffed(group.schemaRef); validate = compileValidator(featureSchema);
          rdfBase = BASE; frameCtxRef = BASE + group.schemaRef;
        } else {
          if (!validateAsOOLD(group.schema)) { bad(`INVALID    feature schema ${file} :: ${label}: ` + JSON.stringify(validateAsOOLD.errors)); continue; }
          const s = structuredClone(group.schema); delete s.$schema;
          validate = compileValidator(s); ctx = group.schema["@context"];
          featureSchema = group.schema; frameCtxRef = ctx;
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
        if (t.roundtrip) {
          try {
            const doc = t.data["@context"] ? { ...t.data } : { "@context": ctx, ...t.data };
            delete doc.$schema;
            const nq = await jsonld.toRDF(doc, { base: rdfBase, format: "application/n-quads" });
            const back = await jsonld.fromRDF(nq, { format: "application/n-quads" });
            const restored = embeddedProperties(featureSchema).length
              ? await jsonld.frame(back, schemaToFrame(featureSchema, frameCtxRef), { base: rdfBase, omitDefault: true })
              : await jsonld.compact(back, frameCtxRef, { base: rdfBase });
            if (JSON.stringify(canonical(doc)) === JSON.stringify(canonical(restored))) ok(`${file} :: ${label} :: ${t.description} [roundtrip]`);
            else bad(`WRONG      ${file} :: ${label} :: ${t.description} [roundtrip] instance != reconstruction\n  in:  ${JSON.stringify(canonical(doc))}\n  out: ${JSON.stringify(canonical(restored))}`);
          } catch (e) { bad(`ERROR      ${file} :: ${label} :: ${t.description} [roundtrip]: ${e.message}`); }
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

console.log(`\n${total - failures}/${total} checks passed${warnings ? `, ${warnings} warning(s)` : ""}`);
process.exit(failures ? 1 : 0);
