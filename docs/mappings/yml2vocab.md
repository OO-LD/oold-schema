# yml2vocab

[yml2vocab](https://w3c.github.io/yml2vocab/) is a vocabulary-publishing tool (widely used by the W3C Verifiable Credentials community): from a short YAML term list it generates an RDFS vocabulary, a JSON-LD context and ReSpec HTML. It defines *terms*, not data schemas, so it is complementary to OO-LD: the context it produces is exactly what an OO-LD schema references in its `@context`.

## yml2vocab (YAML term list, abbreviated)

```yaml
vocab:
  - id: ex
    value: https://example.org/vocab#
class:
  - id: Person
property:
  - id: name
    domain: Person
```

## OO-LD Schema (consuming the generated vocabulary)

```json
{
  "@context": ["https://example.org/vocab/context.jsonld", { "type": "@type" }],
  "$id": "Person.schema.json",
  "title": "Person",
  "type": "object",
  "properties": {
    "type": { "const": "ex:Person" },
    "name": { "type": "string" }
  }
}
```

The vocabulary and context that yml2vocab publishes for `ex:Person` / `ex:name` are referenced directly by the OO-LD schema, so the term definitions stay owned by the vocabulary while the OO-LD schema adds structure.
