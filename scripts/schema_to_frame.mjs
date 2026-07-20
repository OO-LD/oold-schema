// Minimal schema-to-frame derivation for OO-LD.
//
// Compaction alone reconstructs literals and references from RDF, but an embedded
// object is flattened into a separate (blank) node and compaction never re-nests a
// flat graph. Framing does. This module derives, from an OO-LD schema, the minimal
// JSON-LD frame needed to reconstruct a schema's instances:
//
//   - @type is the schema's instance rdf:type(s) (x-oold-instance-rdf-type), so the
//     exported root - which materializes that type - is the frame root and embedded
//     objects nest beneath it rather than surfacing as sibling graph nodes;
//   - @context is the schema's own context (or a reference to it), so terms compact
//     back to their property names;
//   - an empty subframe {} is added for each property that embeds an object, detected
//     as a @context term carrying a scoped @context. Reference-valued and literal
//     properties need no subframe: a referenced IRI with no local triples stays
//     { id: ... } and literals compact directly.
//
// Use with jsonld.frame(rdf, frame, { omitDefault: true }) so a property absent from a
// given instance is omitted rather than emitted as null.

// Collect the object-valued term definitions of a @context (which may be a string, an
// array, or an object), keyed by term name; keyword entries (@vocab, @version, ...) are
// skipped.
export function contextTerms(context, out = {}) {
  if (Array.isArray(context)) {
    for (const c of context) contextTerms(c, out);
    return out;
  }
  if (context && typeof context === "object") {
    for (const [term, def] of Object.entries(context)) {
      if (term.startsWith("@")) continue;
      if (def && typeof def === "object") out[term] = def;
    }
  }
  return out;
}

// Properties that embed an object: their @context term carries a scoped @context.
export function embeddedProperties(schema) {
  const terms = contextTerms(schema["@context"]);
  return Object.keys(terms).filter((t) => "@context" in terms[t]);
}

// The instance rdf:type(s) a schema declares. Composition is most-derived-wins
// (override, consistent with @context): the nearest declaration in the composition
// chain is authoritative; superclass types are recoverable by ontology inference and
// are not materialized. A subclass that wants supertypes in the data lists them
// explicitly. After dereference the most-derived value is at the top level; the fallback
// walks allOf only for a subclass that omits its own declaration.
export function instanceRdfTypes(schema) {
  if (!schema || typeof schema !== "object") return null;
  const own = schema["x-oold-instance-rdf-type"];
  if (Array.isArray(own) && own.length) return own;
  if (Array.isArray(schema.allOf)) {
    for (const sub of schema.allOf) {
      const t = instanceRdfTypes(sub);
      if (t) return t;
    }
  }
  return null;
}

// Derive the minimal frame. contextRef, when given, is used as the frame's @context in
// place of the schema's inline @context (pass the schema URL so a document loader
// resolves inherited/scoped contexts).
export function schemaToFrame(schema, contextRef) {
  const frame = { "@embed": "@once" };
  frame["@context"] = contextRef !== undefined ? contextRef : schema["@context"];
  const types = instanceRdfTypes(schema);
  if (types) frame["@type"] = types.length === 1 ? types[0] : types;
  for (const p of embeddedProperties(schema)) frame[p] = {};
  return frame;
}
