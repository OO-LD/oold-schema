## Meta-schema and Vocabulary {#meta-schema}

OO-LD adds keywords on top of JSON Schema 2020-12. All OO-LD-proprietary
keywords are prefixed with `x-oold-` so they are valid JSON Schema
extension keywords and, at the same time, valid OpenAPI 3.0 Specification
Extensions. The only non-prefixed OO-LD-specific entry is `@context`,
which is a JSON-LD keyword and cannot be renamed.

The OO-LD dialect is described by a meta-schema ([[OOLD-META]]). It extends the
standard 2020-12 meta-schema and adds the syntax of the `x-oold-*`
keywords. The OO-LD vocabulary is declared **optional** so that
generic 2020-12 validators still process OO-LD schemas instead of refusing
them. Declaring a vocabulary does not make a validator execute keyword
behavior; that is supplied by OO-LD-aware tooling.

--8<-- "spec/generated/vocabulary.md"
