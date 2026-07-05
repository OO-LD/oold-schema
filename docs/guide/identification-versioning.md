# Identification & Versioning

Every OO-LD schema has a globally unique, resolvable `$id` and a stable `x-oold-uuid` (which the `$id` typically embeds). A schema may also declare the ontology class it realizes (`x-oold-iri`, distinct from both the document `$id` and the instance `rdf:type`).

Versions are expressed in the schema's location - appended for a single schema, prepended as a package version (recommended), or via a GitHub release tag - and instances should always reference a *versioned* schema URL so it is unambiguous which version they conform to.

Learn more:

- [Semantic Versioning](https://semver.org/)
- [W3C OWL Ref: Version Information](https://www.w3.org/TR/owl-ref/#VersionInformation)
- [JSON Schema Organisation issue on schema versions](https://github.com/json-schema-org/website/issues/197)

For the normative rules and worked examples (`$id`/`x-oold-uuid`, `x-oold-iri`, version annotations, backward-compatibility, and relative-URI packages), see [Identification and Versioning](../spec/#identification-versioning) in the specification.
