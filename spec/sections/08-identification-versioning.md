## Identification and Versioning {#identification-versioning}

### Identification {#identification}

:rule[OOLD-VER-3b96]{applies=document level=MUST summary="A schema must have a $id serving as its global unique identifier."}OO-LD schemas MUST have a `$id` ([[JSONSCHEMA]] §8.2.1) which works as a global and unique identifier of the schema. The value of `$id` MAY be an absolute URI (details below). :rule[OOLD-VER-2e63]{applies=document machine_checkable=no level=SHOULD summary="A schema should be resolvable via its $id."}The schema SHOULD be resolvable via this URI. :rule[OOLD-VER-edb9]{applies=document level=SHOULD summary="A schema should carry an x-oold-uuid annotation holding a UUID value."}The schema SHOULD have an annotation `x-oold-uuid` with a UUID value.

This obligation applies to a schema *document*, not to every subschema: a fragment inside `properties`, `$defs` or [`x-oold-range`](#range-of-properties) legitimately has no `$id` of its own. The dialect meta-schema enforces exactly that distinction and so checks the requirement itself - see [](#meta-schema).

:::example{title="A schema `$id` and its `x-oold-uuid`"}
```json
{
  "$id": "https://example.org/Foo.schema.json",
  "x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
  "title": "Foo"
}
```

It is recommended to use the UUID also in the `$id`:
```json
{
  "$id": "https://example.org/b5203131-7321-46bb-8a11-acb3d1015840.schema.json",
  "x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
  "title": "Foo"
}
```
:::

### Ontology correspondence (schema-level `x-oold-sssom`) {#ontology-mapping}

A schema states which external ontology resources it corresponds to with a top-level `x-oold-sssom` block - the [term-synonym](#synonyms) mapping row lifted to the schema level. Its subject is the schema itself, identified by its `$id`: in OO-LD the schema document at that URL *is* the class definition, so `$id` serves as the mapping's `subject_id`. It is an object keyed by the **object IRI** of a resolvable resource (an RDF/OWL class, a controlled-vocabulary term, another schema), each value carrying the SSSOM slots: `predicate_id` (default `skos:exactMatch`; `skos:closeMatch` for a looser correspondence), `mapping_set_id`, and the rest of the open bag. Because these are SKOS mapping predicates the correspondence is non-logical and reasoner-safe: `skos:exactMatch` asserts interchangeability, not the logical `owl:equivalentClass` (a schema that wants the reasoner-affecting claim uses `owl:equivalentClass` explicitly as the `predicate_id`). It is an annotation **about the schema itself** and is not stamped onto instances - distinct from `x-oold-instance-rdf-type`, the `rdf:type`s instances carry on export (see [](#semantic-type)), which *are* stamped onto instance data.

:::example{title="Distinguishing document URL, ontology correspondence, and instance type"}
```json
{
  "$id": "https://example.org/my-package/1.0.0/Person.schema.json",
  "x-oold-sssom": {
    "https://schema.org/Person": { "predicate_id": "skos:exactMatch" }
  },
  "x-oold-instance-rdf-type": ["schema:Person"],
  "title": "Person"
}
```
:::

Here the schema document is fetched from the `$id` URL, it is declared an exact match for `schema:Person`, and instances exported to RDF carry `@type: schema:Person`. Commonly a schema's exact match and the entries in `x-oold-instance-rdf-type` resolve to the same IRI, but they may differ - a schema may model a more specific subclass inline while emitting a broader `rdf:type`, or exact-match one class while close-matching a related one in another vocabulary. Because this is the same mapping machinery as term synonyms, the schema-level mappings carry the same `predicate_id` semantics, `mapping_set_id` selection and SSSOM round-trip (see [](#synonyms)).

OO-LD-aware tooling uses these correspondences to anchor the schema in an ontology graph, independently of where the schema document is hosted - for example to resolve super-classes, look up ontology annotations, or generate SHACL shapes.

### Versioning {#versioning}

:rule[OOLD-VER-3662]{applies=document level=SHOULD summary="A schema version should be stated with x-oold-version."}The schema version SHOULD be indicated by `x-oold-version`; a prior version MAY be indicated with `x-oold-prior-version`:

:::example{title="Version annotations"}
```json
{
  "$id": "https://example.org/b5203131-7321-46bb-8a11-acb3d1015840.schema.json",
  "x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
  "title": "Foo",
  "x-oold-version": "1.1.0",
  "x-oold-prior-version": "1.0.0"
}
```
:::

:rule[OOLD-VER-534a]{applies=document level=SHOULD summary="The schema version should be part of the schema location URL."}The version SHOULD be part of the schema's location:

- :rule[OOLD-VER-befc]{applies=document machine_checkable=no level=SHOULD summary="Under single-schema versioning, the version should be appended after the schema name in the $id."}For **single-schema** versioning, the version SHOULD be appended after the schema name, e.g. `https://example.org/b5203131-7321-46bb-8a11-acb3d1015840.schema.json/1.1.0`.
- :rule[OOLD-VER-4261]{applies=document machine_checkable=no level=SHOULD summary="Under schema-package versioning, the package version should be prepended before the schema id."}For **schema-package** versioning (recommended), the version of the package SHOULD be prepended before the schema's ID, e.g. `https://example.org/my-package/2.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json`.
- or using release tags on GitHub, e.g. `https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json`.

Since a package combines multiple schemas, the package version does in general not match the individual schema version.

Schemas MAY indicate explicit backward-compatibility with `x-oold-backward-compatible-with` and `x-oold-incompatible-with`:

:::example{title="Declaring backward-compatibility"}
```json
{
  "$id": "https://example.org/my-package/2.1.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json",
  "x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
  "title": "Foo",
  "x-oold-version": "1.1.0",
  "x-oold-prior-version": "1.0.0",
  "x-oold-backward-compatible-with": "https://example.org/my-package/2.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json",
  "x-oold-incompatible-with": "https://example.org/my-package/1.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json"
}
```
:::

Schemas within a package or package repository MAY use relative URIs ([[RFC3986]] §5.1). For example, `A.schema.json` referenced from `https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/`:

:::example{title="Relative `$ref` inside a package"}
```json
{
  "$id": "B.schema.json",
  "title": "Foo",
  "allOf": [ { "$ref": "A.schema.json" } ]
}
```

expands to:
```json
{
  "$id": "https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/B.schema.json",
  "title": "Foo",
  "allOf": [ { "$ref": "https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/A.schema.json" } ]
}
```
:::

Instance documents SHOULD always use a versioned schema URL to make clear which schema version they comply with:

:::example{title="An instance pinned to a schema version"}
```json
{
  "@context": "https://example.org/my-package/1.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json",
  "$schema": "https://example.org/my-package/1.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json"
}
```
:::

Upgrade APIs MAY provide automated data migration between schema (package) versions, e.g. `https://example.org/upgrade/my-package/1.0.0...2.0.0`.
