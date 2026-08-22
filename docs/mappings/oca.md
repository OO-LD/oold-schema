# Overlays Capture Architecture (OCA)

[OCA](https://oca.colossi.network/specification/) takes the opposite approach to a single unified document: a minimal capture base carries attribute names and core data types, and separate, content-addressed (SAID) overlays add labels, formats, units, encodings and mappings. OO-LD folds those concerns into one schema; the overlay types have direct OO-LD counterparts.

## OCA (capture base + label and conformance overlays, abbreviated)

```json
{
  "capture_base": {
    "type": "spec/capture_base/1.0",
    "attributes": { "full_name": "Text", "date_of_birth": "DateTime" }
  },
  "overlays": {
    "label": { "attribute_labels": { "full_name": "Full name", "date_of_birth": "Date of birth" } },
    "conformance": { "attribute_conformance": { "full_name": "M", "date_of_birth": "O" } }
  }
}
```

## OO-LD Schemas (modular, mirroring the overlays)

OO-LD composes with `$ref` plus a remote `@context` (see the guide's Composition section), so OCA's overlay structure maps directly onto **cross-referencing OO-LD schema modules**: a base capture schema carries the structure and core types, and each overlay becomes a small schema that references the base and contributes exactly one concern (labels, a localized label set, semantics, formats) - the same distributed-authorship pattern as OCA overlays.

Base capture schema (structure and core types only):
```json
{
  "$id": "Person.capture.schema.json",
  "type": "object",
  "properties": {
    "full_name": { "type": "string" },
    "date_of_birth": { "type": "string", "format": "date" }
  },
  "required": ["full_name"]
}
```

Label overlay - references the base and sets only labels (a second, differently-labelled overlay is just another such module):
```json
{
  "$id": "Person.label-en.schema.json",
  "allOf": [{ "$ref": "Person.capture.schema.json" }],
  "properties": {
    "full_name": { "title": "Full name" },
    "date_of_birth": { "title": "Date of birth" }
  }
}
```

Semantics overlay - references the base and adds only the `@context`:
```json
{
  "$id": "Person.semantics.schema.json",
  "@context": { "schema": "http://schema.org/", "full_name": "schema:name", "date_of_birth": "schema:birthDate" },
  "allOf": [{ "$ref": "Person.capture.schema.json" }]
}
```

The same concerns MAY also be consolidated into one OO-LD document when modularity is not needed; both forms are valid OO-LD.

| OCA overlay | OO-LD |
| --- | --- |
| capture base attribute + data type | `properties.<name>` with `type` / `format` |
| label overlay | `title` (and `x-oold-multilang-title` for languages) |
| conformance overlay (M/O) | `required` |
| unit / format / encoding overlay | `format`, `x-oold-ui-*` |
| attribute mapping overlay | `@context` term IRI |
| a whole overlay object | a schema module that `$ref`s the base and adds one concern |

The key difference is identity and semantics: OCA addresses overlays by content hash (SAID) and reaches meaning only through a separate attribute-mapping overlay, whereas OO-LD modules are addressed by resolvable `$id` and carry the IRIs natively in `@context`. When patching a schema owned elsewhere rather than layering new modules, OO-LD's own [overlay delivery](../guide/extensions.md) (OpenAPI Overlay actions for `x-oold-ui-*`) provides the "patch without editing" pattern.
