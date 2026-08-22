# TreeLDR

[TreeLDR](https://www.spruceid.dev/treeldr/treeldr-overview) (SpruceID, used in the Verifiable Credentials / DID space) centres on **RDF layouts**. Its primary notation is a JSON layout document that maps a tree value to and from an RDF dataset (`dehydrate` = tree to RDF, `hydrate` = RDF to tree). A layout is a `record` of `fields`, each binding a tree field to an RDF `property` IRI and a value layout (its datatype):

## TreeLDR layout (abbreviated)

```json
{
  "id": "https://example.org/#RecordLayout",
  "type": "record",
  "prefixes": { "tldr": "https://treeldr.org/prelude#" },
  "fields": {
    "id":   { "value": { "layout": "tldr:id" } },
    "name": { "value": "tldr:string", "property": "https://schema.org/name" }
  }
}
```

## OO-LD Schema

```json
{
  "@context": { "schema": "https://schema.org/", "name": "schema:name", "id": "@id" },
  "$id": "Record.schema.json",
  "type": "object",
  "properties": {
    "id":   { "type": "string", "format": "iri" },
    "name": { "type": "string" }
  }
}
```

A layout field's `property` becomes an `@context` term IRI, its value layout becomes the JSON Schema `type` (with `@type` coercion), and the field mapped to the node identity (`tldr:id`) becomes `@id`. TreeLDR's dehydrate/hydrate is exactly OO-LD's expansion (via `@context`) and framing (RDF back to the tree, see the guide) - so an OO-LD schema is a layout that additionally validates. TreeLDR also compiles to JSON Schema, JSON-LD contexts and SDKs; those artefacts recombine into an OO-LD schema as in the LinkML mapping above.
