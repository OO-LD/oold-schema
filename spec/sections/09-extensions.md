## Standard Extensions {#extensions}

On top of plain JSON Schema and JSON-LD, OO-LD defines a small set of extensions. This section covers the JSON-LD extensions and the JSON Schema extensions in turn.

### JSON-LD {#jsonld-extensions}

OO-LD targets [[JSON-LD11]].

#### Processing mode (`@version`) {#processing-mode}

OO-LD composition relies on JSON-LD 1.1 features, in particular scoped contexts: a `$ref` within a `type: object` property is reflected as a property-scoped `@context` (see [](#composition)). Such features are unavailable to a processor running in the `json-ld-1.0` processing mode.

Generated OO-LD contexts SHOULD therefore declare `"@version": 1.1` (the JSON number `1.1`, not the string `"1.1"`). Modern processors default to the 1.1 processing mode, so this is a guard rather than a strict requirement: it prevents a JSON-LD 1.0 processor from silently mis-processing a 1.1 document ([[JSON-LD11]] §4.1.1). Because the first encountered `@version` entry determines the processing mode, it is sufficient to declare `"@version": 1.1` once in the base context of a composition (for example a root `Thing` schema).

#### Multi-Mapping {#multi-mapping}

JSON-LD allows only a single keyword-IRI mapping (or more precisely, ignores all but the last mapping). There is currently no way to express that a property has two IRIs (e.g. `"label": {"@id": ["schema:name", "skos:prefLabel"]}`, see [json-ld/json-ld.org#160](https://github.com/json-ld/json-ld.org/issues/160)). As a workaround, an additional context notation is provided: `<property>*(*)` pointing to additional `@id` mappings, to document alternative options or drive custom RDF generation. (The redesign of this notation is tracked in [OO-LD/schema#12](https://github.com/OO-LD/schema/issues/12).)

:::example{title="Documenting alternative mappings"}
```json
{
    "@context": [
        {
            "@version": 1.1,
            "skos": "https://www.w3.org/TR/skos-reference/",
            "schema": "https://schema.org/",
            "label": "skos:prefLabel",
            "label*": "schema:name",
            "label**": "..."
        }
    ],
    "label": "test"
}
```

Default JSON-LD processing interprets only the preferred mapping:
```ttl
_:b0 <skos:prefLabel> "test" .
```

An OO-LD-aware converter MAY also produce redundant triples for interoperability:
```ttl
_:b0 <skos:prefLabel> "test" .
_:b0 <schema:name> "test" .
```
:::

The notation can also drive data transformation and normalization. For example, a dataset in which persons and organizations report their relations in a syntactically non-interoperable way can be normalized into a consistent unified dataset (see [OO-LD/schema#11](https://github.com/OO-LD/schema/issues/11)).

:::example{title="Normalizing a syntactically non-interoperable dataset"}
Input - the same relation is reported in three different ways (`works_for`, a distinct `works_for*`, and a backward `employees`):
```yaml
"@graph":
- id: demo:person1
  type: schema:Person
  name: Person1
  works_for: demo:organizationA # forward relation
  works_for*: demo:organizationB # forward relation but different property
- id: demo:organizationA
  type: schema:Organization
- id: demo:organizationB
  type: schema:Organization
- id: demo:organizationC
  type: schema:Organization
  employees: demo:person1 # backwards relation
```

Normalized - a single, consistent representation:
```yaml
"@graph":
- employees:
  - demo:person1
  - demo:person2
  - demo:person3
  id: demo:organizationA
  label:
  - lang: en
    text: organizationA
  type: schema:Organization
- id: demo:person1
  name: Person1
  type: schema:Person
- id: demo:person2
  name: Person2
  type: schema:Person
- id: demo:person3
  name: Person3
  type: schema:Person
```
:::

### JSON Schema {#jsonschema-extensions}

OO-LD targets [[JSONSCHEMA]] (2020-12) as its normative dialect. An OO-LD schema SHOULD declare the OO-LD dialect meta-schema (which extends 2020-12) as its `$schema`, e.g. `"$schema": "https://oo-ld.github.io/oold-schema/latest/meta/oold-meta-schema.json"` - pinning a specific version (e.g. `.../0.4.0/meta/oold-meta-schema.json`) for reproducibility. Declaring the plain 2020-12 meta-schema (`https://json-schema.org/draft/2020-12/schema`) remains valid for tools that only understand standard JSON Schema.

2020-12 is REQUIRED, not merely preferred: OO-LD's composition places `$ref` alongside sibling keywords (e.g. a property carrying `type`, `x-oold-range` and `@context`, or `allOf: [{$ref: ...}]` next to `properties`). Keywords adjacent to `$ref` are only evaluated from JSON Schema 2019-09 onward; in Draft 4 and Draft 7 they are ignored ([[JSONSCHEMA]] §8.2.3.1). Keywords such as `const` (used throughout this document) are likewise only available from draft-06 onward. Migration from the earlier Draft-4-style notation: rename `definitions` to `$defs`, `id` to `$id`, and use the numeric form of `exclusiveMinimum`/`exclusiveMaximum` instead of the boolean form.

#### Multilanguage support {#multilanguage}

There are two distinct localization concerns: translating a schema's own annotations, and translating a value carried by an instance.

##### Localizing schema annotations {#localizing-schema-annotations}

The JSON Schema annotation keywords `title` and `description` carry a single, default human-readable string used by tooling (for example for UI generation). To provide localized variants, OO-LD adds the keywords `x-oold-multilang-title` and `x-oold-multilang-description`. Their value MUST be an object whose keys are [BCP 47](https://www.rfc-editor.org/info/bcp47) language tags (e.g. `en`, `de`, `en-GB`) and whose values are the translated strings. A schema SHOULD still provide a default `title` / `description`; a consumer that has no entry for the requested language falls back to that default. These keywords localize the schema's *own* labels and are not interpreted as JSON-LD.

:::example{title="Localized schema annotations"}
```json
{
    "title": "Default Title",
    "description": "Default description",
    "x-oold-multilang-title": { "en": "Title (en)", "de": "Titel (de)" },
    "x-oold-multilang-description": { "en": "Description (en)", "de": "Beschreibung (de)" }
}
```
:::

##### Localizing instance values {#localizing-instance-values}

To localize a *value of an instance* - a translatable string in the data that should round-trip to language-tagged RDF literals - do not use the keywords above; use the standard JSON-LD mechanism. There are two equivalent JSON-LD-native ways to carry such a value, both producing the same language-tagged literals.

**Explicit** - model the value as an object that pairs its text with its language by aliasing `text` to `@value` and `lang` to `@language`. This form is convenient for form-based editors, where each translation is an editable row:

:::example{title="Explicit language-tagged value object"}
```json
{
  "@context": {
    "text": { "@id": "@value" },
    "lang": { "@id": "@language" }
  },
  "$id": "Label.schema.json",
  "title": "Label",
  "type": "object",
  "required": ["text", "lang"],
  "properties": {
    "text": {
      "title": "Text",
      "x-oold-multilang-title": { "de": "Text" },
      "type": "string",
      "minLength": 1
    },
    "lang": {
      "title": "Lang code",
      "x-oold-multilang-title": { "de": "Sprache" },
      "type": "string",
      "enum": ["en", "de"]
    }
  }
}
```

A property typed as an array of `Label` then holds one entry per language:
```json
[{ "text": "Water", "lang": "en" }, { "text": "Wasser", "lang": "de" }]
```
:::

**Compact** - a language map keyed directly by language tag, via `@container: @language` ([[JSON-LD11]] Language Maps):

:::example{title="Compact language map"}
```json
{
  "@context": {
    "label": { "@id": "http://schema.org/name", "@container": "@language" }
  },
  "type": "object",
  "properties": {
    "label": {
      "type": "object",
      "additionalProperties": { "type": "string" }
    }
  }
}
```

An instance such as `{ "label": { "en": "Water", "de": "Wasser" } }` expands to the same two language-tagged literals as the explicit form.
:::

#### Range of properties (`x-oold-range`) {#range-of-properties}

JSON Schema itself supports linked data only in the form of a subobject; references to independent external objects are just URL-strings without further restrictions. To express constraints on the type of the referenced object - as in OWL and SHACL - the keyword `x-oold-range` is introduced (see also [json-schema-org/json-schema-vocabularies#55](https://github.com/json-schema-org/json-schema-vocabularies/issues/55)). It takes one of three forms:

1. An **IRI** (string) referencing a single allowed target schema. This is the common case:

:::example{title="Range as a single IRI"}
```json
{
  "@context": {
    "schema": "http://schema.org/",
    "works_for": "schema:worksFor"
  },
  "title": "Person",
  "type": "object",
  "properties": {
    "works_for": {
      "type": "string",
      "x-oold-range": "Organization.schema.json",
      "description": "IRI pointing to an instance of Organization"
    }
  }
}
```
:::

2. An **array of IRIs**, expressing a union of allowed target schemas, e.g. `["Organization.schema.json", "Person.schema.json"]`.

3. An **OO-LD subschema**, the most expressive form. Unions (`anyOf` / `oneOf`),
intersections (`allOf`) and inline constraints can be combined to describe an anonymous subclass. References to other schemas inside `x-oold-range` MUST use `x-oold-ref`, never `$ref` (see below). The single-IRI form (1) is a shorthand for `{ "allOf": [ { "x-oold-ref": "Organization.schema.json" } ] }`:

:::example{title="Range as a subschema (Organization located in Germany)"}
```json
"x-oold-range": {
  "allOf": [
    { "x-oold-ref": "Organization.schema.json" },
    { "properties": { "address": { "properties": { "country": { "const": "DE" } } } } }
  ]
}
```
:::

A range subschema MAY also carry additional annotations (e.g. `title`, `description` or further `x-oold-*` keywords) to support tooling - for example a human-readable label for an autocomplete dropdown, or hints used when generating a SHACL shape.

##### Why `x-oold-ref` and not `$ref` {#why-x-oold-ref}

`x-oold-range` is a custom keyword, so a `$ref` placed inside it is undefined behavior for generic JSON Schema tooling ([[JSONSCHEMA]] §9.4.2). In practice the behavior is not merely undefined but inconsistent: generic reference resolvers eagerly inline such a `$ref`, and because `x-oold-range` targets can form a cyclic graph of schemas this can pull in an unbounded graph, while schema-aware bundlers instead drop it.

`x-oold-ref` avoids this. Generic tools only follow the standard `$ref` keyword, so they leave `x-oold-ref` untouched; OO-LD-aware tools resolve it deliberately and lazily, with cycle detection. The standard `$ref` continues to be used for ordinary schema composition (`allOf`, `properties`, `$defs`), which bundlers are expected to resolve. Because the only difference is the keyword name, the mapping is reversible: an OO-LD-aware tool can mechanically replace `x-oold-ref` with `$ref` to obtain a plain, fully-resolvable JSON Schema - the explicit opt-in to resolving the (possibly cyclic) graph.

#### Reverse properties {#reverse-properties}

Many relations are symmetric (e.g. Organization employs Person ⇔ Person works for Organization) and users want to edit them from both sides, without storing the information twice. The keywords `x-oold-reverse-properties` and `x-oold-reverse-required` declare such a [=reverse property=], mapped with JSON-LD `@reverse` in the `@context`. (The earlier `x-oold-reverse-default-properties` array is deprecated: mark a reverse property shown by default with `x-oold-ui-default-property` on the property itself - see [](#ui-generation) - which, unlike the merged array, is overridable under composition.) To make `employees` the reverse of `organization`:

- define `employees` in `x-oold-reverse-properties` of `Organization`;
- define `organization` in the `properties` of `Person`;
- map `organization` to a semantic property, e.g. `schema:worksFor`, in the `@context` of `Person`;
- map `employees` with `@reverse` to the same property in the `@context` of `Organization` ([[JSON-LD11]] reverse properties).

:::example{title="Reverse property across two schemas"}
`Organization.schema.json`:
```json
{
  "@context": [
    { "employees": { "@reverse": "schema:worksFor", "@type": "@id" } }
  ],
  "title": "Organization",
  "type": "object",
  "required": ["type"],
  "x-oold-reverse-required": [],
  "x-oold-reverse-properties": {
    "employees": {
      "type": "array",
      "title": "Employees",
      "x-oold-ui-default-property": true,
      "items": {
        "type": "string",
        "format": "autocomplete",
        "title": "Person",
        "x-oold-range": "Person.schema.json"
      }
    }
  }
}
```

`Person.schema.json`:
```json
{
  "@context": [
    { "organization": { "@id": "schema:worksFor", "@type": "@id" } }
  ],
  "title": "Person",
  "defaultProperties": ["organization"],
  "properties": {
    "organization": {
      "title": "Organization",
      "description": "Organization(s) the person is affiliated with. E.g., university, research institute, company, etc.",
      "type": "array",
      "items": {
        "type": "string",
        "format": "autocomplete",
        "x-oold-range": "Organization.schema.json"
      }
    }
  }
}
```
:::

An OO-LD-aware implementation uses this to read and modify properties that are actually stored in another object: loading an `Organization` editor prepopulates `employees` by querying which persons work for it; storing the `Organization` writes it into each referenced person's `organization` field; and removing a person from `employees` removes the organization from theirs.

#### UI Generation {#ui-generation .informative}

OO-LD schemas double as the source for auto-generated forms and views. UI intent is carried in two layers:

- Portable, renderer-agnostic keywords in the `x-oold-ui-*` vocabulary, defined here. Any form generator can honour them.
- Renderer-specific keywords passed through under a vendor prefix - `x-jedison-*` for [jedison](https://github.com/germanbisurgi/jedison), the successor of [json-editor](https://github.com/json-editor/json-editor) - for options that do not generalize.

Every keyword keeps the `x-` prefix, so it is a valid JSON Schema extension keyword and a valid OpenAPI 3.0 specification extension, and generic 2020-12 validators ignore it. The `x-oold-ui-*` keywords form their own optional dialect, described by the [OO-LD UI meta-schema](../meta/oold-ui-meta-schema.json); the core meta-schema includes those definitions so an OO-LD schema carrying UI annotations validates in one pass.

##### The `x-oold-ui-*` vocabulary {#ui-vocabulary}

All keywords apply to the (sub)schema of a single property.

{{ render_schema('meta/oold-ui-meta-schema.json') }}

The text-valued keywords have a `x-oold-multilang-*` variant carrying a BCP-47 language map, mirroring `x-oold-multilang-title` (see [](#localizing-schema-annotations)): `x-oold-multilang-ui-hint` and `x-oold-multilang-ui-enum-titles`.

For enum code generation OO-LD keeps the established `x-enum-varnames` (identifier-safe names aligned with `enum`) and its companion `x-enum-descriptions`; these are widely supported vendor extensions (OpenAPI Generator; NSwag's `x-enumNames`) and are distinct from the human display labels in `x-oold-ui-enum-titles`.

`x-oold-ui-default-property` replaces the json-editor `defaultProperties` array (which listed the optional properties shown initially). That array is *extend-only* under composition: because composed schemas merge the arrays, a derived schema can add a default property but cannot switch one off. A per-property boolean is *overridable* - it resolves most-derived-wins (see [](#merge-and-override-model)), so a derived schema sets it to `false` to hide a property a base schema showed. For the same reason `x-oold-reverse-default-properties` is deprecated in favour of `x-oold-ui-default-property` on the reverse property.

##### Widget hints: `format` vs `x-oold-ui-widget` {#widget-hints}

`format` carries the widget hint when its value is a registered JSON Schema 2020-12 format (`date`, `date-time`, `time`, `duration`, `email`, `uri`, `iri`, `uuid`, ...); a validator may check it and a form generator picks the matching input. Values that are not registered formats (`table`, `tabs`, `grid`, `autocomplete`, `textarea`, `checkbox`, `markdown`, `color`, ...) are widget-only and go in `x-oold-ui-widget`, leaving `format` for validation semantics.

##### Delivery: inline or overlay {#ui-delivery}

UI keywords may be embedded in the schema (inline):

{{ example('UiAnnotations') }}

or applied by an *overlay* - a separate document that patches a schema without editing it, following the [OpenAPI Overlay 1.1.0](https://spec.openapis.org/overlay/latest.html) model. Overlays are a general schema-patching mechanism: the `update` actions can inject any keywords (semantics, constraints or presentation), and applying `x-oold-ui-*` annotations is one use case - useful when the schema is generated or owned elsewhere, or when one schema needs different presentation in different contexts. An overlay lists `actions`, each selecting nodes with an [RFC 9535 JSONPath](https://www.rfc-editor.org/rfc/rfc9535) `target` and merging keys via `update` (or removing them via `remove`):

{{ inline_file('examples/UiOverlay.json') }}

The vendor keywords are documented by their respective projects: jedison's `x-jedison-*` (see [germanbisurgi/jedison#58](https://github.com/germanbisurgi/jedison/issues/58) and the overlay proposal [#59](https://github.com/germanbisurgi/jedison/issues/59)) and, for schemas coming from OpenSemanticLab, the server-side `x-osl-*` keywords. Migrating a legacy OpenSemanticWorld schema to these keywords is covered in the [migration guide](../migration/from-legacy-osw/).
