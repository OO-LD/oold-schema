# Schema Instances

An OO-LD instance is a JSON document that conforms to an OO-LD schema. It references that schema in two ways, both pointing at the same (preferably versioned) schema URL:

- `@context` - the schema URL, loaded as a JSON-LD remote context. This is what makes the instance a JSON-LD document.
- `$schema` - the schema URL, identifying the schema the instance validates against.

```yaml
"@context": https://example.org/my-package/1.0.0/Person.schema.json
$schema: https://example.org/my-package/1.0.0/Person.schema.json
```

An instance can also carry its own identity as an `@id` (usually exposed through an aliased `id` property), and on export its semantic `@type` is materialized from the schema's `x-oold-instance-rdf-type`.

For the full rules - how a tool resolves an instance's schema, the standards-conformant `describedby` HTTP alternative, `@id` handling, and how the semantic type is carried (with examples) - see [Schema Instances](../spec/#schema-instances) in the specification.
