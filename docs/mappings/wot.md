# WoT JSON Schema in RDF

The W3C Web of Things note [JSON Schema in RDF](https://www.w3.org/2019/wot/json-schema) attaches a JSON-LD context to a schema's instances with the `jsonld:context` property, keeping the JSON Schema keywords and the instance context in one document - the closest standards precedent for OO-LD.

## WoT

```json
{
  "@context": { "jsonld": "http://www.w3.org/ns/json-ld#" },
  "jsonld:context": "http://schema.org",
  "type": "object",
  "description": "Schema of a commercial product with GTIN and manufacturer",
  "properties": {
    "gtin14": { "type": "string" },
    "manufacturer": { "type": "string" }
  }
}
```

## OO-LD Schema

```json
{
  "@context": "http://schema.org",
  "title": "Product",
  "description": "Schema of a commercial product with GTIN and manufacturer",
  "type": "object",
  "properties": {
    "gtin14": { "type": "string" },
    "manufacturer": { "type": "string" }
  }
}
```

The `jsonld:context` value becomes OO-LD's top-level `@context` (here a remote context URL). OO-LD does not wrap the context under a `jsonld:` term, so the schema document is itself directly consumable as a JSON-LD remote context.
