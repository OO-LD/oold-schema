# SPDX 3.0

[SPDX 3.0](https://spdx.github.io/spdx-spec/) is model-driven. Its primary notation is not JSON-LD but a **constrained-Markdown model** (one file per class/property in the [`spdx-3-model`](https://github.com/spdx/spdx-3-model) repository); a `spec-parser` then generates the OWL ontology with SHACL shapes, the JSON-LD context, and the JSON Schema. A document is validated both structurally (JSON Schema) and semantically (SHACL). OO-LD reaches the same dual validation from a single artefact - the OO-LD schema *is* the JSON Schema, and its `@context` yields the RDF that SHACL checks - without maintaining a separate generated schema and context.

## SPDX model (constrained Markdown, class `Package`, abbreviated)

```markdown
# Package

## Metadata

- name: Package
- SubclassOf: /Software/SoftwareArtifact

## Properties

- packageVersion
  - type: xsd:string
  - minCount: 0
  - maxCount: 1
- downloadLocation
  - type: xsd:anyURI
  - minCount: 0
  - maxCount: 1
```

## OO-LD Schema (the same class, single artefact)

```json
{
  "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
  "$id": "Package.schema.json",
  "title": "Package",
  "allOf": [{ "$ref": "SoftwareArtifact.schema.json" }],
  "properties": {
    "type": { "const": "software_Package" },
    "packageVersion": { "type": "string" },
    "downloadLocation": { "type": "string", "format": "uri" }
  }
}
```

| SPDX model construct | OO-LD |
| --- | --- |
| `# Name` / `name:` metadata | `title` plus the node `type` constant (IRI supplied by `@context`) |
| `SubclassOf: X` | `allOf: [{ "$ref": "X.schema.json" }]`, context inherited |
| property `type: xsd:*` | property `type` (with `@type` datatype coercion in `@context`) |
| `minCount: 1` | property listed in `required` |
| `maxCount: 1` (vs unbounded) | single value (otherwise `type: array`) |
| property name / path | a term IRI in `@context` |

The OO-LD schema reuses the SPDX-published JSON-LD context (a remote context), so the property names resolve to the same IRIs and datatypes SPDX defines and an instance validated against this schema expands to SPDX RDF. The difference is authoring: SPDX keeps the model, the JSON Schema and the context as three generated artefacts kept in sync by tooling; OO-LD keeps the one document.
