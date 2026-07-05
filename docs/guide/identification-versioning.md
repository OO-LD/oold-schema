# Identification & Versioning

## Identification

OO-LD schemas MUST have a `$id` (see <https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.1>) which works as a global and unique identifier of the schema. The value of `$id` MAY be a absolute URI (details below). The schema SHOULD be resolvable via this URI. The schema SHOULD have a annotation `x-oold-uuid` with an UUID value.

```yaml
$id: https://example.org/Foo.schema.json
x-oold-uuid: b5203131-7321-46bb-8a11-acb3d1015840
title: Foo
```

It is recommended to use the UUID also in the `$id`:

```yaml
$id: https://example.org/b5203131-7321-46bb-8a11-acb3d1015840.schema.json
x-oold-uuid: b5203131-7321-46bb-8a11-acb3d1015840
title: Foo
```

## Ontology class IRI (`x-oold-iri`)

`x-oold-iri` declares the IRI of the ontology class that this schema realizes - the RDF/OWL class from an external vocabulary that gives the schema its semantic grounding. It is distinct from two related IRIs:

- `$id` - the URL of the schema document (where to fetch it). A schema document is a retrievable artifact, not an OWL class.
- `x-oold-instance-rdf-type` - the rdf:types that instances carry on export (see [Carrying the semantic type](schema-instances.md#carrying-the-semantic-type)). These are stamped onto instance data; `x-oold-iri` describes the schema itself.

```yaml
$id: https://example.org/my-package/1.0.0/Person.schema.json
x-oold-iri: https://schema.org/Person
x-oold-instance-rdf-type: ["schema:Person"]
title: Person
```

In this example, the schema document is fetched from the `$id` URL, it realizes the ontology class `schema:Person`, and instances exported to RDF carry `@type: schema:Person`. The most common case is that `x-oold-iri` and the entries in `x-oold-instance-rdf-type` resolve to the same IRI, but they may differ - for example when a schema models a more specific subclass inline while still emitting a broader rdf:type on instances.

OO-LD-aware tooling uses `x-oold-iri` to anchor the schema in an ontology graph, independently of where the schema document is hosted - for example to resolve super-classes, look up ontology annotations, or generate SHACL shapes.

## Versioning

Learn more:

- [Semantic Versioning](https://semver.org/)
- [W3C OWL Ref Version Information](https://www.w3.org/TR/owl-ref/#VersionInformation)
- [JSON Schema Organisation Issue about Schema versions](https://github.com/json-schema-org/website/issues/197)

The schema version SHOULD be indicated by `x-oold-version`, a prior version MAY be indicated with `x-oold-prior-version`

```yaml
$id: https://example.org/b5203131-7321-46bb-8a11-acb3d1015840.schema.json
x-oold-uuid: b5203131-7321-46bb-8a11-acb3d1015840
title: Foo
x-oold-version: 1.1.0
x-oold-prior-version: 1.0.0
```

- For single schema versioning, the version SHOULD be part of the `$id` - appended after the schema name, e.g.
`https://example.org/b5203131-7321-46bb-8a11-acb3d1015840.schema.json/1.1.0`
- For schema package versioning (recommended), the version of the package SHOULD be prepended before the schema's ID, e.g.
`https://example.org/my-package/2.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json`
- or using release tags on GitHub, e.g.
`https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json`

> Note: Since a package combines multiple schemas the packages version does in general not match the schema version.

Schemas MAY indicate explicit backward-compatibility:

```yaml
$id: https://example.org/my-package/2.1.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json
x-oold-uuid: b5203131-7321-46bb-8a11-acb3d1015840
title: Foo
x-oold-version: 1.1.0
x-oold-prior-version: 1.0.0
x-oold-backward-compatible-with: https://example.org/my-package/2.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json
x-oold-incompatible-with: https://example.org/my-package/1.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json
```

Schemas within a package or package repository may use relative URIs (see <https://www.rfc-editor.org/rfc/rfc3986#section-5.1>), e.g. `https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/A.schema.json` has the content

```yaml
$id: B.schema.json
title: Foo
allOf:
  - $ref: A.schema.json
```

which expands to

```yaml
$id: https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/B.schema.json
title: Foo
allOf:
  - $ref: https://raw.githubusercontent.com/MyOrg/my-package/refs/heads/2.0.0/A.schema.json
```

Instance document SHOULD always use a versioned schema url to make clear with which schema version they comply, e.g.

```yaml
"@context": https://example.org/my-package/1.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json 
$schema: https://example.org/my-package/1.0.0/b5203131-7321-46bb-8a11-acb3d1015840.schema.json
```

Upgrade-APIs MAY provide automated data migration between schema (package) versions, e.g. `https://example.org/upgrade/my-package/1.0.0...2.0.0`
