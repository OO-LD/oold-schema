# From RDF, in particular JSON-LD

You already have data as RDF. OO-LD lets a single document be both the JSON-LD **context** that turns that RDF into idiomatic JSON and the **JSON Schema** that validates the result, so meaning and structure travel together. Follow one `schema:Person` from triples to a validated OO-LD instance.

## 1. Plain RDF triples (Turtle)

```turtle
@prefix schema: <http://schema.org/> .

<https://example.org/alice>
    a schema:Person ;
    schema:name "Alice" .
```

## 2. Compact JSON-LD

A context that aliases `id` to `@id`, `type` to `@type`, and `name` to `schema:name` - plus an `ex` prefix for our own IRIs - compacts those triples into plain-looking JSON:

```json
{
  "@context": {
    "id": "@id",
    "type": "@type",
    "ex": "https://example.org/",
    "schema": "http://schema.org/",
    "name": "schema:name"
  },
  "id": "ex:alice",
  "type": "schema:Person",
  "name": "Alice"
}
```

Any JSON-LD processor round-trips between (1) and (2); the JSON keys stay as plain as `name` and `type`, and `id` shortens to the compact IRI `ex:alice`.

## 3. OO-LD schema: the context plus structural validation

The OO-LD schema carries that same `@context` and adds a JSON Schema shape, so the JSON is not only meaningful but validated. Because `type` is now a normal (aliased) property, the class is modelled as a `const`:

{{ inline_file('examples/RdfPerson.schema.json') }}

The schema-level `type: "object"` (a JSON Schema keyword) and the `type` *property* (the aliased `@type`) coexist without clashing. A `const` pins the class exactly, which is fine for a standalone type. Under inheritance it is too strict - a subtype could not set its own class - so use `default` instead of `const` (a derived schema widens it), or record the classes in `x-oold-instance-rdf-type`, which composes across the inheritance chain and is materialized on export.

## 4. The instance, referencing the schema

The stored instance is the JSON-LD document from (2) with one change: instead of an inline context it names the schema (a relative reference here, a versioned URL when deployed) as a **remote `@context`**, and the same reference as `$schema`. The schema then supplies both the context and the validation:

{{ inline_file('examples/RdfPerson.instance.json') }}

Consumed as a remote context this reproduces the JSON-LD in (2), and exporting it yields the triples in (1). The short `id` works because `ex:` is a context prefix, which expands whether the context is inline or remote. A context `@base` is less portable for the remote case: the JSON-LD context-processing algorithm skips `@base` while processing a remote context, yet some processors still apply it - so prefer a prefix (compact IRI) to keep instance IRIs short.

The schema and instance are committed example files (`examples/RdfPerson.schema.json`, `examples/RdfPerson.instance.json`), covered by `make validate`: meta-schema, formats, and JSON-LD conversion to RDF.

## Next steps

- [Basic Concepts](../guide/basic-concepts.md) - schema-as-context.
- [Schema Instances](../guide/schema-instances.md) - `$schema`, remote `@context`, `@id` and type on instances.
- [From OWL or SHACL](from-owl-shacl.md) - if your starting point is an ontology or shapes.
