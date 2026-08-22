# REST API Linked Data (x-jsonld-*)

[REST API Linked Data Keywords](https://datatracker.ietf.org/doc/html/draft-polli-restapi-ld-keywords-08) attaches a JSON-LD context to each JSON Schema / OpenAPI Schema Object via `x-jsonld-context` and `x-jsonld-type`, so that JSON-LD lives inside a document that OpenAPI 3.0 accepts (OpenAPI 3.0 rejects a top-level `@context`). This is the same "annotate JSON Schema in place" idea as OO-LD, delivered per class instead of per document. The mapping to and from OO-LD is mechanical and reversible; the forward direction (OO-LD to an OpenAPI 3.0 bundle) is shown in [Use Cases -> Delivery to OpenAPI, MCP and LLM tooling](../use-cases.md). The reverse direction ingests a REST-API-LD Schema Object into an OO-LD schema:

## REST-API-LD (OpenAPI 3.0)

```json
{
  "components": {
    "schemas": {
      "Person": {
        "x-jsonld-context": { "schema": "http://schema.org/", "name": "schema:name" },
        "x-jsonld-type": ["schema:Person"],
        "type": "object",
        "properties": { "name": { "type": "string" } },
        "required": ["name"]
      }
    }
  }
}
```

## OO-LD Schema

```json
{
  "@context": { "schema": "http://schema.org/", "name": "schema:name" },
  "$id": "Person.schema.json",
  "x-oold-instance-rdf-type": ["schema:Person"],
  "title": "Person",
  "type": "object",
  "properties": { "name": { "type": "string" } },
  "required": ["name"]
}
```

`x-jsonld-context` maps to the top-level `@context` and `x-jsonld-type` to `x-oold-instance-rdf-type`. Both forms produce the same triples; a bundle of several classes becomes one OO-LD schema package with cross-schema `$ref`s.
