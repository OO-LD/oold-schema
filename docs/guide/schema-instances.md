# Schema Instances

An OO-LD instance is a JSON document that conforms to an OO-LD schema. It references that schema in two ways, both pointing at the same (preferably versioned) schema URL:

- `@context` - the schema URL, loaded as a JSON-LD remote context. This is what makes the instance a JSON-LD document.
- `$schema` - the schema URL, identifying the schema the instance validates against.

```yaml
"@context": https://example.org/my-package/1.0.0/Person.schema.json
$schema: https://example.org/my-package/1.0.0/Person.schema.json
```

An instance can also carry its own identity as an `@id` (usually exposed through an aliased `id` property), and on export its semantic `@type` is materialized from the schema's `x-oold-instance-rdf-type`.

## Property value forms

A property that points at another resource can appear in three forms: a plain **literal** (`"Mainstreet 1, 10115 Example City"`), a **reference** to an entity by IRI (`{ "id": "https://example.org/address/A1" }`), or an **embedded object** with no identity of its own (`{ "type": "PostalAddress", "streetAddress": "..." }`). Each projects to RDF differently, so the schema's `@context` has to be set up to match the forms a property allows.

The tricky case is a property whose range mixes free text with references or embedded objects (schema.org's `address = Text | PostalAddress | Place` is a typical example). A single `@context` term cannot read a bare string as both a literal and an IRI, so OO-LD offers two round-trip-safe patterns:

- **Value-form** - one plain term; the JSON value shape alone tells the forms apart. Object references keep an `id`, and a reference can also carry cached hints (a label, coordinates) beside it.
- **Separate keys** - a canonical `@type: "@id"` term for references and embedded objects, plus a plain companion term (e.g. `address_text`) for the literal.

Pick one and use it consistently across a model ecosystem. The OpenSemanticWorld schema packages use the separate-keys pattern, and `oold-python` currently supports that one; the value-form pattern additionally lets a reference store cached information such as a label or a display IRI. Both are committed example schemas whose every form is round-trip-checked by `make validate`: `examples/Contact.schema.json` (value-form `address`) and `examples/ContactSeparateKeys.schema.json` (canonical `address` plus a plain `address_text`).

## Round-trip to RDF and back

Literals and references reconstruct from RDF by plain JSON-LD compaction, but an embedded object is flattened into a separate node in RDF and has to be re-nested with [framing](../spec/#framing) (OO-LD derives the frame from the schema). Repeated properties are set-valued in RDF - order and duplicates are not preserved - so declare `@container: "@set"` to keep the array shape stable, and use `@language` for multilingual instance text.

Any member sitting beside `@id` in a reference is a **cache**: indicative, possibly stale data. Where it disagrees with the referenced target's own properties, the target wins.

For the full rules - how a tool resolves an instance's schema, the standards-conformant `describedby` HTTP alternative, `@id` handling, how the semantic type is carried, the two ambiguous-range patterns, and the RDF round-trip contract (all with examples) - see [Schema Instances](../spec/#schema-instances) in the specification.
