# Standard extensions

On top of plain JSON Schema and JSON-LD, OO-LD defines a small set of extensions. This page covers the JSON-LD extensions and the JSON Schema extensions in turn.

## JSON-LD

OO-LD targets [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/).

### Processing mode (`@version`)

OO-LD composition relies on JSON-LD 1.1 features, in particular scoped contexts: a `$ref` within a `type: object` property is reflected as a property-scoped `@context` (see [Composition](composition.md)). Such features are unavailable to a processor running in the `json-ld-1.0` processing mode.

Generated OO-LD contexts SHOULD therefore declare `"@version": 1.1` (the JSON number `1.1`, not the string `"1.1"`). Modern processors default to the 1.1 processing mode, so this is a guard rather than a strict requirement: it prevents a JSON-LD 1.0 processor from silently mis-processing a 1.1 document (see [JSON-LD 1.1 section 4.1.1](https://www.w3.org/TR/json-ld11/#json-ld-1-1-processing-mode)).

Because the first encountered `@version` entry determines the processing mode, it is sufficient to declare `"@version": 1.1` once in the base context of a composition (for example a root `Thing` schema). Schemas that reference that base first in their `@context` array inherit the 1.1 processing mode and need not repeat it.

### Multi-Mapping

JSON-LD allows only a single keyword-IRI mapping (or more precisely, ignores all but the last mapping). Currently, there is no way to express that a property has two ids (e.g. with `"label": {"@id": ["schema:name", "skos:prefLabel"]}`, see also [json-ld/json-ld.org#160](https://github.com/json-ld/json-ld.org/issues/160)). As a workaround, an additional context notation is provided: `<property>*(*)` pointing to additional `@id` mappings to provide at least a documentation for alternative options or custom RDF generation.

see also: <https://github.com/OO-LD/schema/issues/12>

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

Default JSON-LD processing would only interpret the preferred mapping:

```ttl
_:b0 <skos:prefLabel> "test" .
```

An OO-LD aware convert could also produce redundant triples for interoperability reasons:

```ttl
_:b0 <skos:prefLabel> "test" .
_:b0 <schema:name> "test" .
```

Furthermore, this notation can be used for data transformation and normalization
As an example a dataset could consist of persons and organizations that report their relations in a syntactically non-interoperable way:

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

Normalizing would lead to a consistent unified dataset. For more information see <https://github.com/OO-LD/schema/issues/11>

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

## JSON Schema

OO-LD targets [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core) as its normative dialect. An OO-LD schema SHOULD declare `"$schema": "https://json-schema.org/draft/2020-12/schema"` (or an OO-LD dialect meta-schema derived from it).

2020-12 is required, not merely preferred: OO-LD's composition places `$ref` alongside sibling keywords (e.g. a property carrying `type`, `x-oold-range` and `@context`, or `allOf: [{$ref: ...}]` next to `properties`). Keywords adjacent to `$ref` are only evaluated from JSON Schema 2019-09 onward; in Draft 4 and Draft 7 they are ignored (see [2020-12 Core section 8.2.3.1](https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.1)). Keywords such as `const` (used throughout this document) are likewise only available from draft-06 onward.

Migration from the earlier Draft-4-style notation: rename `definitions` to `$defs`, `id` to `$id`, and use the numeric form of `exclusiveMinimum`/`exclusiveMaximum` instead of the boolean form.

### Multilanguage support

There are two distinct localization concerns: translating a schema's own annotations, and translating a value carried by an instance.

#### Localizing schema annotations

The JSON Schema annotation keywords `title` and `description` carry a single, default human-readable string used by tooling (for example for UI generation). To provide localized variants, OO-LD adds the keywords `x-oold-multilang-title` and `x-oold-multilang-description`.

Their value MUST be an object whose keys are [BCP 47](https://www.rfc-editor.org/info/bcp47) language tags (e.g. `en`, `de`, `en-GB`) and whose values are the translated strings. A schema SHOULD still provide a default `title` / `description`; a consumer that has no entry for the requested language falls back to that default. These keywords localize the schema's *own* labels and are not interpreted as JSON-LD.

```json
{
    "title": "Default Title",
    "description": "Default description",
    "x-oold-multilang-title": { "en": "Title (en)", "de": "Titel (de)" },
    "x-oold-multilang-description": { "en": "Description (en)", "de": "Beschreibung (de)" }
}
```

#### Localizing instance values

To localize a *value of an instance* - a translatable string in the data that should round-trip to language-tagged RDF literals - do not use the keywords above. Use the standard JSON-LD mechanism. There are two equivalent JSON-LD-native ways to carry such a value, both producing the same language-tagged literals:

**Explicit** - model the value as an object that pairs its text with its language by aliasing `text` to `@value` and `lang` to `@language`. This form is convenient for form-based editors, where each translation is an editable row (note that the schema's own labels are localized with `x-oold-multilang-title`):

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

A property typed as an array of `Label` then holds one entry per language, e.g.

```json
[{ "text": "Water", "lang": "en" }, { "text": "Wasser", "lang": "de" }]
```

**Compact** - a language map keyed directly by language tag, via `@container: @language` (see [JSON-LD 1.1, Language Maps](https://www.w3.org/TR/json-ld11/#language-maps)):

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

An instance such as

```json
{ "label": { "en": "Water", "de": "Wasser" } }
```

expands to the same two language-tagged literals as the explicit form.

### Range of properties

JSON Schema itself supports linked data only in the form of a subobject. References to independent external objects are just URL-strings without any further restrictions. To express constraints on the type of the referenced object - as we know it from OWL and SHACL - the keyword `x-oold-range` is introduced (see also [json-schema-org/json-schema-vocabularies#55](https://github.com/json-schema-org/json-schema-vocabularies/issues/55)).

`x-oold-range` takes one of three forms:

1. An **IRI** (string) referencing a single allowed target schema. This is the common case:

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

2. An **array of IRIs**, expressing a union of allowed target schemas, e.g. `["Organization.schema.json", "Person.schema.json"]`.

3. An **OO-LD subschema**, the most expressive form. Unions (`anyOf` / `oneOf`), intersections (`allOf`) and inline constraints can be combined to describe an anonymous subclass. References to other schemas inside `x-oold-range` MUST use `x-oold-ref`, never `$ref` (see below). The single-IRI form (1) is a shorthand for this:

```json
"x-oold-range": { "allOf": [ { "x-oold-ref": "Organization.schema.json" } ] }
```

For example, to require that the target is an `Organization` located in Germany:

```json
"x-oold-range": {
  "allOf": [
    { "x-oold-ref": "Organization.schema.json" },
    { "properties": { "address": { "properties": { "country": { "const": "DE" } } } } }
  ]
}
```

A range subschema MAY also carry additional annotations (e.g. `title`, `description` or further `x-oold-*` keywords) to support tooling - for example a human-readable label for an autocomplete dropdown, or hints used when generating a SHACL shape.

#### Why `x-oold-ref` and not `$ref`

`x-oold-range` is a custom keyword, so a `$ref` placed inside it is undefined behavior for generic JSON Schema tooling (see [2020-12 Core section 9.4.2](https://json-schema.org/draft/2020-12/json-schema-core#section-9.4.2)). In practice the behavior is not merely undefined but inconsistent: generic reference resolvers eagerly inline such a `$ref`, and because `x-oold-range` targets can form a cyclic graph of schemas this can pull in an unbounded graph, while schema-aware bundlers instead drop it.

`x-oold-ref` avoids this. Generic tools only follow the standard `$ref` keyword, so they leave `x-oold-ref` untouched; OO-LD-aware tools resolve it deliberately and lazily, with cycle detection (for example to populate an autocomplete field or to generate a SHACL shape). The standard `$ref` continues to be used for ordinary schema composition (`allOf`, `properties`, `$defs`), which bundlers are expected to resolve.

Because the only difference from a standard reference is the keyword name, the mapping is reversible: an OO-LD-aware tool can mechanically replace `x-oold-ref` with `$ref` to obtain a plain JSON Schema whose range subschemas become fully resolvable and bundleable by generic tooling - useful when a consumer deliberately wants the composed, dereferenced schema. By default `x-oold-ref` leaves the (possibly cyclic) graph unresolved; swapping it to `$ref` is the explicit opt-in to resolution.

### Reverse properties

There are many cases where relations are symmetric, e.g. Organization employees Person <=> Person worksFor Organization.

However, usually we do not want to store this information in different schemas but allow users to edit it from both sides.

For this use case the additional keywords `x-oold-reverse-properties`, `x-oold-reverse-default-properties` and `x-oold-reverse-required` are introduced

To make `employees` the reverse property of `organization` we have to

- define `employees` in the schema section   `x-oold-reverse-properties` of Organization
- define `works_for` in the schema section   `x-oold-reverse-properties` of Person
- map `employees` to a semantic property, e.g. `schema:worksFor` in the `@context` of Person
- map `employees` with `@reverse` in the `@context` of Organization to the same property, compliant to [JSON-LD @reverse](https://www.w3.org/TR/json-ld11/#reverse-properties)

Example:

#### Organization.schema.json

```json
{
  "@context": [
    {
      "employees": {
        "@reverse": "schema:worksFor",
        "@type": "@id"
      }
    }
  ],
  "title": "Organizational",
  "type": "object",
  "required": [
    "type"
  ],
  "properties": {
    "...": {}
  },
  "x-oold-reverse-required": [],
  "x-oold-reverse-default-properties": [
    "employees"
  ],
  "x-oold-reverse-properties": {
    "employees": {
      "type": "array",
      "title": "Employees",
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

#### Person.schema.json

```json
{
  "@context": [
    {
      "organization": {
        "@id": "schema:worksFor",
        "@type": "@id"
      }
    }
  ],
  "title": "Person",
  "defaultProperties": [
    "organization"
  ],
  "properties": {
    "organization": {
      "title": "Organization",
      "description": "Organization(s) the person is affiliated with. E.g., university, research institute, company, etc.",
      "type": "array",
      "items": {
        "type": "string",
        "title": "Organization",
        "format": "autocomplete",
        "x-oold-range": "Organization.schema.json"
      }
    }
  }
}
```

An OO-LD aware implementation can make use of this annotation to allow to read and modify properties that are actually stored in another object. E.g., When loading a UI editor for an Organization, the editor will prepopulate the field `employees` by executing the query "Which persons work for this organization"?

When storing an Organization, the editor will also load the Persons referenced in `employees` and stores the current Organization in their `organization` field, following the `@context` mappings of both schemas.

Deleting a Person in `employees` will also delete the Organization from the corresponding field.

### UI Generation

Additional keywords defined by [JSON Schema Editor](https://github.com/json-editor/json-editor), see [Basic features](https://github.com/json-editor/json-editor#readme) and [Further details](https://github.com/json-editor/json-editor/blob/master/README_ADDON.md)
