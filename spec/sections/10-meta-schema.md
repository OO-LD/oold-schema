## Meta-schema and Vocabulary {#meta-schema}

OO-LD adds keywords on top of JSON Schema 2020-12. All OO-LD-proprietary keywords are prefixed with `x-oold-` so they are valid [JSON Schema extension keywords](https://json-schema.org/draft/2020-12/json-schema-core#section-6.5) and, at the same time, valid [OpenAPI 3.0 Specification Extensions](https://spec.openapis.org/oas/v3.0.3.html#specification-extensions) (OpenAPI 3.0 rejects unprefixed custom keywords in a Schema object). The only non-prefixed OO-LD-specific entry is `@context`, which is a JSON-LD keyword and cannot be renamed.

The OO-LD dialect is described by a meta-schema ([[OOLD-META]]). It extends the standard 2020-12 meta-schema and adds the syntax of the `x-oold-*` keywords, so an OO-LD schema can be validated *as* an OO-LD schema. The meta-schema declares its vocabularies via `$vocabulary`: the seven standard 2020-12 vocabularies are re-listed as required (they are not inherited through `$ref`, [[JSONSCHEMA]] §8.1.2.2), and the OO-LD vocabulary is declared **optional** (`false`) so that generic 2020-12 validators still process OO-LD schemas instead of refusing them.

Declaring a vocabulary does not make a validator execute keyword behavior; that is supplied by OO-LD-aware tooling (e.g. the `oold` library). The meta-schema only validates that `x-oold-*` keywords are well-formed and provides a machine-readable `description` for each. The `x-oold-*` keywords are:

{{ vocabulary() }}
