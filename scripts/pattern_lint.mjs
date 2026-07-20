// Round-trip-safe pattern checks for an OO-LD schema that JSON Schema cannot express on
// its own, because they correlate a value in `properties` with a key in `@context`. These
// complement meta/oold-pattern-lint.schema.json (the JSON-Schema-expressible part, e.g. no
// @type: xsd:string). See docs/tooling.md for how the validation pipeline applies them.
import { contextTerms } from "./schema_to_frame.mjs";

// A property is a *strict* array (accepts only arrays) if it is typed array directly. A
// cardinality-flexible shape - type: ["array","string"], or a oneOf/anyOf that also permits a
// scalar - is NOT strict: its scalar form still validates after a round-trip, so @container
// @set is optional there (a MAY), not required.
function isStrictArray(p) {
  if (!p || typeof p !== "object") return false;
  if (p.type === "array") return true;
  if (("items" in p || "prefixItems" in p) && p.type === undefined) return true;
  return false;
}

// MUST: a *strictly* array-typed property must declare @container @set (or @list), because
// the reconstructed instance must re-validate: without it a single-element array comes back
// as a scalar and violates the `array` type (and duplicates/order are lost). Returns locally
// declared strict-array properties whose local @context term declares neither. A cardinality-
// flexible (oneOf literal|array) property is out of scope - there @container is only a MAY.
// Properties mapped only in an inherited (remote) context are also out of scope here.
export function arrayPropertiesMissingContainer(schema) {
  const terms = contextTerms(schema["@context"]);
  const props = schema.properties || {};
  const missing = [];
  for (const [name, p] of Object.entries(props)) {
    if (!p || typeof p !== "object") continue;
    if (!isStrictArray(p)) continue;
    const def = terms[name];
    const container = def && def["@container"];
    const hasContainer =
      container === "@set" ||
      container === "@list" ||
      (Array.isArray(container) && (container.includes("@set") || container.includes("@list")));
    if (name in terms && !hasContainer) missing.push(name);
  }
  return missing;
}

// SHOULD (lexical-form recommendation, not loss): a bare-IRI-string reference (a string
// value coerced to an IRI by @type:@id, typed by x-oold-range) should constrain its form
// with an IRI/URI-family format - iri-reference (recommended - accepts absolute, compact and
// relative IRIs), or a stricter iri / uri-reference / uri. Returns such properties (and array
// items) that declare none. Only string-valued @type:@id terms are checked; value-form
// (plain) and object-valued (embedded) ranges are out of scope.
const IRI_FORMATS = new Set(["iri-reference", "iri", "uri-reference", "uri"]);
export function iriReferencesMissingFormat(schema) {
  const terms = contextTerms(schema["@context"]);
  const props = schema.properties || {};
  const out = [];
  const isIriTerm = (def) => def && def["@type"] === "@id";
  const hasRange = (n) => n && typeof n === "object" && "x-oold-range" in n;
  for (const [name, p] of Object.entries(props)) {
    if (!p || typeof p !== "object" || !isIriTerm(terms[name])) continue;
    if (p.type === "string" && hasRange(p) && !IRI_FORMATS.has(p.format)) out.push(name);
    else if (p.items && p.items.type === "string" && hasRange(p.items) && !IRI_FORMATS.has(p.items.format)) out.push(`${name}[]`);
  }
  return out;
}
