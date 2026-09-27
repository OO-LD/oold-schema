# From JSON Schema

You already describe the **structure** of your data with JSON Schema. An OO-LD schema *is* a JSON Schema, so yours is almost there - you add its **meaning**:

1. An `@context` that maps your property names to semantic terms (IRIs). Required at the root of every schema document, even when empty ([`OOLD-SCH-96a3`](../rules.md#oold-sch-96a3)).
2. A `$id` that identifies the schema globally ([`OOLD-VER-3b96`](../rules.md#oold-ver-3b96)).
3. `$schema` pointing at the OO-LD meta-schema, so OO-LD-aware tools recognize the dialect.

The first two are what the meta-schema requires of a document; without either, validation fails.

Before - a plain JSON Schema:

```json
{
  "title": "Minimal",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the thing" }
  }
}
```

After - the same schema as OO-LD:

{{ example('Minimal') }}

Your existing JSON Schema validators keep working unchanged: `@context` and every `x-oold-*` keyword are extension keywords that generic 2020-12 validators ignore. Keep JSON keys tool-friendly by aliasing (`name` -> `schema:name`) instead of using IRIs as property names.

## Next steps

- [Basic Concepts](../guide/basic-concepts.md) - how one document is both a schema and a context.
- [Composition](../guide/composition.md) - assemble types from reusable building blocks.
