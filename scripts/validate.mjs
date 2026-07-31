#!/usr/bin/env node
// With no argument this validates this package's own examples/ (full two-tier suite). Given a
// directory argument (`oold-validate <dir>`) it validates that directory's *.schema.json with
// the general-workflow tier only - so a downstream repo can conformance-check its generated
// schemas with the upstream pipeline. The meta-schemas always come from this package.
//
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
import { dirname, join, resolve } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Target schema directory: a CLI argument (an external repo's schemas) or, by default, this
// package's own examples/. Meta-schemas are always loaded from this package (below).
const targetArg = process.argv[2];
const exDir = targetArg ? resolve(process.cwd(), targetArg) : join(root, "examples");
const meta = JSON.parse(readFileSync(join(root, "meta", "oold-meta-schema.json"), "utf8"));
// The dialect body, carrying $dynamicAnchor "meta": the root meta-schema $refs it and adds the
// document-level obligations (required: $id), while nested subschemas recurse into the base via
// $dynamicRef and so are not required to carry $id.
const baseMeta = JSON.parse(readFileSync(join(root, "meta", "oold-meta-schema-base.json"), "utf8"));
const uiMeta = JSON.parse(readFileSync(join(root, "meta", "oold-ui-meta-schema.json"), "utf8"));
const patternLint = JSON.parse(readFileSync(join(root, "meta", "oold-pattern-lint.schema.json"), "utf8"));
// Rule catalog (meta/oold-rules.json), generated from the spec prose by scripts/extract_rules.py.
// Optional: a checkout from before the catalog existed still validates, just without rule coverage.
const ruleCatalog = (() => {
  try { return JSON.parse(readFileSync(join(root, "meta", "oold-rules.json"), "utf8")).rules || []; }
  catch { return []; }
})();
const rulesById = new Map(ruleCatalog.map((r) => [r.id, r]));
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
ajv.addSchema(baseMeta); // the dialect body the root meta-schema $refs
const validateAsOOLD = ajv.compile(meta); // also validates the meta-schema against 2020-12
// SHOULD-level round-trip pattern lint over a schema's @context (no @type: xsd:string, ...).
const validatePatternLint = ajv.compile(patternLint);

// Compile a dereferenced example schema into a plain instance-validator. The custom $schema
// (the OO-LD meta URL) is dropped so ajv uses the 2020-12 dialect; x-oold-* keywords are
// unknown to ajv and ignored (strict:false), which is the intended validator/UI split.
const derefCache = {};
// Dereferencing inlines $refs, so a schema with cyclic embeds (a value type that embeds
// itself, e.g. schema.org QuantitativeValue.valueReference -> QuantitativeValue) becomes a
// graph with circular object references, and one where many properties share the same
// referenced leaf/embed nodes. Faker, ajv and the variant walker would recurse without bound
// on the cycles. boundSchema returns a finite, acyclic copy: a node on the current path (a
// cycle) or beyond maxDepth instance levels is cut, and shared nodes are memoized so the DAG
// is not unrolled into an exponentially larger tree. Non-cyclic, shallow schemas (this
// repo's examples) are copied unchanged.
//
// Depth counts *instance* nesting (properties/items/... descent), not raw JSON nesting: an
// allOf/anyOf hop or a subclass chain adds JSON depth without nesting the instance, and
// counting it would cut inherited property constraints (turning them permissive) on any
// schema a few subclass levels deep.
//
// The cut must stay permissive for validation (a typed cut would reject legitimate values at a
// node shared with an intact path). It carries only a custom `format`, which two properties
// exploit:
//  - ajv (strict:false, validateFormats:true) has no assertion for an unknown format and the
//    node declares no `type`, so it accepts any value - the required permissiveness.
//  - json-schema-faker treats a `format` node as a string and, via the `formats` option below,
//    emits a deterministic marker string for it. This matters because for a *typeless* node
//    the faker instead picks a random type, so at a permissive cut it would emit booleans /
//    numbers as often as strings - and a non-string under an `@type:"@id"` term becomes an RDF
//    literal that cannot compact back under that term, a false round-trip loss. Forcing a
//    string is safe: it round-trips under any term (an IRI reference under @id, a literal under
//    a plain term). A unique per-call counter keeps distinct @id-coerced cuts from collapsing
//    into one RDF node. (The `formats` option is the supported custom-format hook in this faker
//    version - the top-level registerFormat()/define() do not apply to createGenerator; the
//    version is pinned so this documented behavior is stable.)
const CUT_SCHEMA = { format: "x-oold-cut" };
let cutCounter = 0;
// Custom faker format generators. `x-oold-cut` renders the cut marker (see above). The others
// cover formats this faker version has no built-in generator for (its built-ins are date-time,
// email, uri, hostname, ipv4/ipv6, uuid, json-pointer) - without them the faker emits a plain
// random string that fails the corresponding ajv format assertion, a false satisfiability
// failure. Each value is a canonical, ajv-accepted lexical form.
const jsfGen = createGenerator({
  alwaysFakeOptionals: true, useExamplesValue: true, useDefaultValue: true, maxItems: 1, maxLength: 40,
  formats: {
    "x-oold-cut": () => `https://oo-ld.test/cut/${cutCounter++}`,
    duration: () => "P1DT2H",
    date: () => "2020-01-02",
    time: () => "03:04:05Z",
  },
});
// JSON Schema keywords whose value (or whose members' values) describes a nested instance
// level; descending into them consumes depth budget. Everything else (composition, $defs,
// annotations, @context) is depth-neutral.
const INSTANCE_KEYWORDS = new Set(["items", "additionalItems", "additionalProperties", "contains", "propertyNames", "unevaluatedItems", "unevaluatedProperties"]);
const INSTANCE_MAP_KEYWORDS = new Set(["properties", "patternProperties"]);
function boundSchema(root, maxDepth = 6) {
  const cut = () => JSON.parse(JSON.stringify(CUT_SCHEMA));
  // Pass 1: each node's minimum instance depth over all paths reaching it (0-1 BFS: an
  // instance-keyword descent costs 1, anything else 0). A shared node is then cut (or kept)
  // identically everywhere, instead of depending on which path happened to reach it first -
  // otherwise one allOf member can carry an intact copy of a property while another carries
  // an over-cut permissive copy of the same property, and the faker satisfies only the cut.
  const minDepth = new Map();
  const queue = [[root, 0]];
  while (queue.length) {
    const [node, depth] = queue.shift();
    if (node === null || typeof node !== "object") continue;
    if (minDepth.has(node) && minDepth.get(node) <= depth) continue;
    minDepth.set(node, depth);
    if (Array.isArray(node)) {
      for (const x of node) queue.push([x, depth]);
      continue;
    }
    for (const [k, v] of Object.entries(node)) {
      const step = INSTANCE_KEYWORDS.has(k) || k === "prefixItems" ? 1 : 0;
      if (INSTANCE_MAP_KEYWORDS.has(k) && v && typeof v === "object" && !Array.isArray(v)) {
        queue.push([v, depth]);
        for (const pv of Object.values(v)) queue.push([pv, depth + 1]);
      } else {
        queue.push([v, depth + step]);
      }
    }
  }
  // Pass 2: copy, cutting cycles (path-local) and nodes whose best depth exceeds the budget.
  const memo = new Map();
  // Keywords whose value is a map of *names* to schemas (not a schema itself).
  const MAP_KEYWORDS = new Set([...INSTANCE_MAP_KEYWORDS, "$defs", "definitions", "dependentSchemas"]);
  const walk = (node, path, inMap) => {
    if (node === null || typeof node !== "object") return node;
    if (path.has(node)) return cut();      // cycle: node references itself or an ancestor
    if (memo.has(node)) return memo.get(node); // shared node already bounded: reuse (keep DAG)
    if ((minDepth.get(node) ?? 0) > maxDepth) return cut();
    path.add(node);
    const out = Array.isArray(node) ? [] : {};
    memo.set(node, out);
    if (Array.isArray(node)) node.forEach((x, i) => (out[i] = walk(x, path)));
    else for (const [k, v] of Object.entries(node)) {
      // Drop identity keys: dereferencing inlines a $ref'd leaf under many properties, each
      // keeping its $id, which makes ajv see one $id resolving to several schemas. Only where
      // they are schema *keywords*: inside a property map their names are instance member
      // names, and a schema may legitimately declare members called `$schema` or `$id`
      // (an exported instance carries both), which must survive into the validation view.
      if (!inMap && (k === "$id" || k === "$schema")) continue;
      // Entries of a property map are always schemas, so the flag only ever applies one level.
      out[k] = walk(v, path, !inMap && MAP_KEYWORDS.has(k));
    }
    path.delete(node);
    return out;
  };
  return walk(root, new Set());
}

async function dereffed(schemaFile) {
  if (!derefCache[schemaFile]) {
    const d = await $RefParser.dereference(join(exDir, schemaFile));
    delete d.$schema;
    derefCache[schemaFile] = boundSchema(d);
  }
  return derefCache[schemaFile];
}

// A schema's @context can reference other schema files, both as a parent context and as a
// term's scoped @context. When those references form a cycle (e.g. a value type whose scoped
// context embeds itself), a JSON-LD processor must eagerly validate the recursive scoped
// context. Per the spec that validation is recursion-bounded (validate scoped context = false
// + context overflow), but neither jsonld.js (heap OOM) nor PyLD (RecursionError) bounds it -
// so such a schema cannot be round-tripped by the mainstream processors. Detect the schemas
// that (transitively) reach such a cycle so the round-trip can skip them with a note instead
// of exhausting memory. A self-reference through the top-level context (no scoped @context) is
// NOT a cycle here and round-trips fine.
function contextFileRefs(ctx, out = new Set()) {
  // Every *.schema.json string anywhere in the @context is a remote-context reference
  // (a parent context or a term's scoped context). x-oold-range references live in
  // `properties`, not `@context`, so they are correctly excluded (they load no context).
  if (typeof ctx === "string") { if (ctx.endsWith(".schema.json")) out.add(ctx); return out; }
  if (Array.isArray(ctx)) { for (const c of ctx) contextFileRefs(c, out); return out; }
  if (ctx && typeof ctx === "object") for (const v of Object.values(ctx)) contextFileRefs(v, out);
  return out;
}
const ctxGraph = {};
for (const f of schemaFiles) {
  try { ctxGraph[f] = [...contextFileRefs(JSON.parse(readFileSync(join(exDir, f), "utf8"))["@context"] ?? null)]; }
  catch { ctxGraph[f] = []; }
}
const cyclicScopedContext = (() => {
  const color = {}, onCycle = new Set();
  const visit = (n, stack) => {
    color[n] = 1;
    for (const m of ctxGraph[n] || []) {
      if (!(m in ctxGraph)) continue;
      if (color[m] === 1) { const i = stack.indexOf(m); for (let j = Math.max(i, 0); j < stack.length; j++) onCycle.add(stack[j]); onCycle.add(m); }
      else if (color[m] === undefined) visit(m, [...stack, m]);
    }
    color[n] = 2;
  };
  for (const f of schemaFiles) if (color[f] === undefined) visit(f, [f]);
  const reaches = new Set(onCycle);
  for (let changed = true; changed; ) {
    changed = false;
    for (const f of schemaFiles) if (!reaches.has(f) && (ctxGraph[f] || []).some((m) => reaches.has(m))) { reaches.add(f); changed = true; }
  }
  return reaches;
})();
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
// A JSON-LD no-op value: null, [], or an array of nothing but no-ops ([null], [[]], ...).
// Such a value produces no triples, so its key legitimately disappears on the way back.
const isNoop = (v) => v === null || (Array.isArray(v) && v.every(isNoop));

function lostKeys(before, after, path = "", lost = []) {
  if (isNoop(before)) return lost;
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
      if (isNoop(before[k])) continue;
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
  // A scalar instance (e.g. a DataType leaf schema whose body is a bare string/boolean) has
  // no properties to lose and cannot carry a @context; nothing to round-trip.
  if (sample === null || typeof sample !== "object" || Array.isArray(sample)) return { lost: [], restored: sample };
  const doc = { "@context": ctxRef, ...sample };
  const types = instanceRdfTypes(schema);
  if (types && !("type" in sample) && !("@type" in sample)) doc["@type"] = types;
  const nquads = await jsonld.toRDF(doc, { base: ctxRef, format: "application/n-quads" });
  const back = await jsonld.fromRDF(nquads, { format: "application/n-quads", useNativeTypes: true });
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
      if (k.startsWith("x-oold-") || k.startsWith("x-enum-") || k === "x-oold-sssom" || k === "@context") set.add(k);
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

// The faker draws URLs from a small pool, so two generated `id` values in one document can
// collide. In RDF the same IRI is the same node: a colliding embed merges into its parent
// and the round-trip then faithfully reports the merged graph - a false schema failure. Give
// every generated node a unique id instead (only where the faker already put one).
let nextId = 0;
function uniquifyIds(v) {
  if (Array.isArray(v)) v.forEach(uniquifyIds);
  else if (v && typeof v === "object") {
    // A distinct authority (not the document BASE host), or compaction would relativize
    // the id against the base and break strict `format: iri` schemas.
    if (typeof v.id === "string") v.id = `https://instances.example.org/id/${nextId++}`;
    for (const x of Object.values(v)) uniquifyIds(x);
  }
  return v;
}

console.log("\nAuto-generated instances (satisfiability, formats respected):");
const genSamples = {};
for (const f of schemaFiles) {
  try {
    const schema = await dereffed(f);
    const sample = await jsfGen.generate(schema);
    uniquifyIds(sample);
    genSamples[f] = sample;
    const validate = compileValidator(schema);
    if (validate(sample)) ok(`${f}`);
    else bad(`GEN-INVALID ${f}: ` + JSON.stringify(validate.errors) + ` sample=${JSON.stringify(sample)}`);
    // An exported instance carries `@context` and `$schema` as ordinary members, so a schema
    // that closes its objects (additionalProperties/unevaluatedProperties false) must PERMIT
    // them or no conforming export validates (see the spec, Referencing the schema with
    // $schema). It need not *declare* them: an open schema permits them implicitly, and an
    // instance held inside an application may omit both. Probing the compiled schema with the
    // two members added is what distinguishes the two closing keywords correctly under
    // composition, where a static check cannot.
    if (sample && typeof sample === "object" && !Array.isArray(sample)) {
      // Probe each member on its own: a validator reporting only its first error would
      // otherwise hide the second.
      const blocked = ["@context", "$schema"].filter((k) => {
        if (k in sample) return false;
        return !validate({ ...sample, [k]: BASE + f }) &&
          (validate.errors || []).some((e) => (e.params?.additionalProperty || e.params?.unevaluatedProperty) === k);
      });
      if (blocked.length) bad(`CLOSED     ${f}: closes its objects but does not permit ${blocked.join(" / ")} - an exported instance carries ${blocked.length > 1 ? "them" : "it"} and would fail validation`);
    }
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
  if (cyclicScopedContext.has(f)) { warn(`${f}: round-trip skipped - reaches a cyclic scoped @context (not processable by jsonld.js/PyLD; flatten to the top-level context)`); continue; }
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
  if (cyclicScopedContext.has(f)) { warn(`${f}: remote-context check skipped - cyclic scoped @context`); continue; }
  try { await jsonld.expand({ "@context": BASE + f, "@id": "https://example.org/dummy" }, { base: BASE }); ok(f); }
  catch (e) { bad(`FAIL       ${f}: ${e.message}`); }
}

console.log("\nJSON-LD - instance roundtrip (instance -> RDF -> instance):");
for (const f of instanceFiles) {
  const inst = JSON.parse(readFileSync(join(exDir, f), "utf8"));
  if (cyclicScopedContext.has(inst.$schema)) { warn(`${f}: round-trip skipped - its schema reaches a cyclic scoped @context (not processable by jsonld.js/PyLD)`); continue; }
  try {
    const nquads = await jsonld.toRDF(inst, { base: BASE + f, format: "application/n-quads" });
    const triples = nquads.split("\n").filter((l) => l.trim()).length;
    if (!triples) throw new Error("produced no triples");
    const back = await jsonld.fromRDF(nquads, { format: "application/n-quads", useNativeTypes: true });
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
const MAX_VARIANTS = 50; // per schema: a large schema can have hundreds of oneOf/anyOf
                         // branches; cloning the schema for each is expensive, so cap and log.
for (const f of schemaFiles) {
  if (cyclicScopedContext.has(f)) continue; // round-trip skipped above; don't OOM here either
  const schema = await dereffed(f);
  const allVariants = collectVariants(schema);
  if (!allVariants.length) continue;
  const variants = allVariants.slice(0, MAX_VARIANTS);
  if (allVariants.length > MAX_VARIANTS) console.log(`NOTE       ${f}: ${allVariants.length} oneOf/anyOf branches, checking first ${MAX_VARIANTS}`);
  const validate = compileValidator(schema);
  for (const v of variants) {
    variantChecks++;
    try {
      const sample = await jsfGen.generate(v.schema);
      uniquifyIds(sample);
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
// Rule ids cited by the fixtures, so the suite can be cross-checked against the catalog the
// same way keyword coverage is cross-checked against the meta-schemas.
const coveredRules = new Set();
const citedRules = [];

if (complianceFiles.length) console.log("\nCompliance suite (deterministic, per feature):");
for (const file of complianceFiles) {
  const groups = JSON.parse(readFileSync(join(complianceDir, file), "utf8"));
  for (const group of groups) {
    const label = group.feature || group.description || file;
    for (const ref of [group.rule, ...(group.schemas || group.lintSchemas || group.tests || []).map((c) => c.rule)]) {
      if (ref) { coveredRules.add(ref); citedRules.push({ ref, where: `${file} :: ${label}` }); }
    }
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
            const back = await jsonld.fromRDF(nq, { format: "application/n-quads", useNativeTypes: true });
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

// vocab coverage: every keyword defined in the meta-schemas must have a well-formedness test.
// This cross-checks the compliance fixtures, so it only applies to self-validation (a target
// directory without a compliance/ suite is not expected to cover the vocabulary).
if (complianceFiles.length) {
  console.log("\nVocab coverage (meta-schema keywords vs oold-vocab.json):");
  const definedKeywords = [
    // @context and x-oold-sssom keep an external standard's name, so they are not x-oold-prefixed.
    ...Object.keys(baseMeta.properties).filter((k) => k.startsWith("x-oold-") || k === "x-oold-sssom" || k === "@context"),
    ...Object.keys(uiMeta.$defs.keywords.properties),
  ];
  const uncovered = definedKeywords.filter((k) => !coveredKeywords.has(k));
  if (!uncovered.length) ok(`all ${definedKeywords.length} x-oold-* / x-oold-ui-* keywords are covered`);
  else bad(`UNCOVERED  ${uncovered.length} keyword(s) defined in the meta-schemas but not tested: ${uncovered.join(", ")}`);
}

// Rule coverage: which normative statements the fixtures actually exercise. A dangling reference
// is an error - it means a fixture cites an id that was renamed or never existed, which is exactly
// what stable ids are supposed to prevent. A checkable rule with no fixture is reported as a
// warning rather than a failure: it is the coverage gap this catalog exists to make visible, and
// failing on it today would only block the build on requirements nobody has written a case for.
if (complianceFiles.length && ruleCatalog.length) {
  console.log("\nRule coverage (compliance fixtures vs meta/oold-rules.json):");
  const dangling = citedRules.filter(({ ref }) => !rulesById.has(ref));
  for (const { ref, where } of dangling) bad(`UNKNOWN-RULE ${where}: cites ${ref}, which is not in the rule catalog`);

  const checkable = ruleCatalog.filter((r) => r.checkable && r.applies_to === "document" && !r.deprecated);
  const missing = checkable.filter((r) => !coveredRules.has(r.id));
  if (!dangling.length) ok(`${coveredRules.size} rule(s) cited by fixtures, all resolving in the catalog`);
  if (missing.length) warn(`${missing.length}/${checkable.length} checkable rule(s) have no fixture: ${missing.map((r) => r.id).join(", ")}`);
  else ok(`all ${checkable.length} checkable rules are exercised by a fixture`);
}

console.log(`\n${total - failures}/${total} checks passed${warnings ? `, ${warnings} warning(s)` : ""}`);
process.exit(failures ? 1 : 0);
