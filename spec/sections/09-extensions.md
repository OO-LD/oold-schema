## Standard Extensions {#extensions}

On top of plain JSON Schema and JSON-LD, OO-LD defines a small set of extensions. This section covers the JSON-LD extensions and the JSON Schema extensions in turn.

### JSON-LD {#jsonld-extensions}

OO-LD targets [[JSON-LD11]].

#### Processing mode (`@version`) {#processing-mode}

OO-LD composition relies on JSON-LD 1.1 features, in particular scoped contexts: a `$ref` within a `type: object` property is reflected as a property-scoped `@context` (see [](#composition)). Such features are unavailable to a processor running in the `json-ld-1.0` processing mode.

:rule[OOLD-EXT-ddda]{applies=document level=SHOULD summary="A generated context should declare @version 1.1 as a JSON number."}Generated OO-LD contexts SHOULD therefore declare `"@version": 1.1` (the JSON number `1.1`, not the string `"1.1"`). Modern processors default to the 1.1 processing mode, so this is a guard rather than a strict requirement: it prevents a JSON-LD 1.0 processor from silently mis-processing a 1.1 document ([[JSON-LD11]] §4.1.1). Because the first encountered `@version` entry determines the processing mode, it is sufficient to declare `"@version": 1.1` once in the base context of a composition (for example a root `Thing` schema).

#### Term mappings and synonyms (`x-oold-context`) {#synonyms}

A JSON-LD `@context` binds each term to a single IRI; a term given several `@id`s keeps only the last. Real vocabularies overlap, so one structural term routinely corresponds to several ontology IRIs - a consensus mapping plus community alternatives. OO-LD expresses these with the schema-level keyword `x-oold-context`: an object keyed by **term**, where each term holds a dict keyed by the **synonym IRI**, and each synonym is a promotable JSON-LD term-definition fragment carrying optional mapping metadata. A *term* here is any context term - most often a property, but equally a class (through the type term, see [](#semantic-type)) or an individual (a value term under `@vocab` coercion, see [](#range-of-properties)) - so the same machinery aliases properties, classes and individuals alike.

In the minimal case a term simply lists alternative IRIs, each with an empty value (`{}`):

:::example{title="Minimal case - a term with alias IRIs"}
```json
{
  "@context": { "description": "schema:description" },
  "x-oold-context": {
    "description": {
      "rdfs:comment": {},
      "skos:definition": {}
    }
  }
}
```
:::

Here `description` (primarily `schema:description`) also maps to `rdfs:comment` and `skos:definition`. Each bare synonym IRI defaults to `predicate_id: skos:exactMatch` and inherits the primary term's coercion on promotion.

Each value is itself a JSON-LD term-definition fragment (`@type`, `@container`, ...) that is promotable verbatim into `@context`, optionally carrying a strippable `x-oold-sssom` block with mapping metadata:

:::example{title="With coercion and SSSOM metadata"}
```json
{
  "@context": { "name": "schema:name" },
  "x-oold-context": {
    "name": {
      "schema:name": { "x-oold-sssom": { "predicate_id": "skos:exactMatch", "confidence": 1.0 } },
      "skos:prefLabel": { "x-oold-sssom": { "predicate_id": "skos:exactMatch", "confidence": 0.95 } },
      "schema:alternateName": { "@container": "@set", "x-oold-sssom": { "predicate_id": "skos:closeMatch" } }
    }
  }
}
```
:::

Each entry is one mapping: the **key** is the synonym IRI (the SSSOM `object_id`), the **value** is a promotable JSON-LD term-definition fragment (`@type`, `@container`, ...) plus an optional `x-oold-sssom` block, and the `subject_id` is implicit - the term's primary `@context` IRI.

**Processing contract.** :rule[OOLD-EXT-7c5d]{applies=implementation level=MUST summary="A conforming mapping processor reads exactly the synonym IRI, the term-definition fragment, predicate_id and mapping_set_id from an entry."}A conforming OO-LD mapping processor MUST read exactly four things from each entry: the **synonym IRI** (the key), the promotable **term-definition fragment**, and two `x-oold-sssom` slots - **`predicate_id`** and **`mapping_set_id`**. :rule[OOLD-EXT-adcc]{applies=implementation level="MUST NOT" summary="Conformance must not depend on anything an entry carries beyond the four contract members."}Conformance MUST NOT depend on anything else an entry carries (the rest of `x-oold-sssom`, any further fragment keys); a processor MAY interpret such keys as its own extension, and MUST carry them through unchanged where it rewrites an entry rather than promoting it - promotion deliberately drops the `x-oold-sssom` blocks, as Selection describes below. Those two slots, over the SKOS predicate vocabulary, are the whole stable contract an implementation depends on.

`predicate_id` is a [SKOS](https://www.w3.org/TR/skos-reference/) mapping predicate - `skos:exactMatch` (the default when the slot is absent), `skos:closeMatch`, `skos:broadMatch`, `skos:narrowMatch` or `skos:relatedMatch` - relating the term's primary IRI (subject) to the synonym IRI (object); it decides which entries denote equivalence. :rule[OOLD-EXT-557e]{applies=implementation level=MUST summary="A predicate_id is written as a full IRI or CURIE and compared by expansion to an absolute IRI."}It MUST be written as a full IRI or a CURIE and compared **by expansion to an absolute IRI**, the same rule the synonym keys follow, so `skos:exactMatch` and `http://www.w3.org/2004/02/skos/core#exactMatch` are one predicate. `x-oold-context` is a *schema*-level keyword consumed by OO-LD processors (it is promoted into a clean `@context` before any generic JSON-LD processor runs), so its CURIEs - the synonym keys and the `predicate_id` / `mapping_set_id` values alike - are expanded not against the instance `@context` but against a fixed **well-known prefix set the meta-schema defines** (`skos`, `rdfs`, `owl`, `xsd`, `sssom`), reached through the schema's `$schema`. The contract therefore holds without the author redeclaring those prefixes in the data context. :rule[OOLD-EXT-1dc8]{applies=document level="MUST NOT" summary="A predicate_id must not be a bare local name."}A bare local name (`exactMatch`) MUST NOT be used as a `predicate_id`.

`mapping_set_id` names the mapping set(s) an entry belongs to, for profile-based selection. SSSOM defines `mapping_set_id` at the set level; OO-LD records it inline on the entry, and an entry MAY belong to several sets (a mapping can appear in more than one), so its value is one `iri-reference` or an array of them, compared by expansion as `predicate_id` is.

**Selection.** :rule[OOLD-EXT-4966]{applies=implementation level=MUST summary="Promotion selects one synonym per term for the target profile, writes it as the term definition and drops the x-oold-sssom blocks."}To promote `x-oold-context` into a real `@context`, a preprocessor MUST select one synonym per term for a **target profile**, write `{ "@id": <synonym IRI>, ...fragment without x-oold-sssom }` as that term's definition, and drop the `x-oold-sssom` blocks, so standard JSON-LD tools then run on a clean context. A profile is expressed either as an ordered list of IRI **namespaces** (ontology-family priority - `schema:` before `bfo:` before `emmo:`) or as one or more **`mapping_set_id`s** (a set may span namespaces, e.g. a PMDco profile of `pmd:` plus reused `obo:` terms). A term with no synonym matching the target keeps its default `@context` IRI. :rule[OOLD-EXT-8f62]{applies=implementation level="MUST NOT" summary="Selection must not use a synonym outside the target profile; within an ordered profile the highest-priority match wins."}Selection MUST NOT use a synonym from outside the target profile; where the profile is an ordered list, the highest-priority match wins and a lower-priority entry is selected only where no higher one matches.

**Co-emission.** Selection yields one IRI per term; for interoperability a converter MAY additionally co-emit the instance value under other synonyms' IRIs. This is a pragmatic interoperability aid, not a logical entailment: `skos:exactMatch` records that two terms are interchangeable across a wide range of applications, but it is *not* `owl:equivalentProperty` / `owl:equivalentClass` and licenses no reasoner inference - which is exactly why the mapping predicates are SKOS (reasoner-safe) rather than OWL. :rule[OOLD-EXT-7256]{applies=implementation level="SHOULD NOT" summary="Entries that are not exactMatch should not be co-emitted unless a consumer explicitly requests it."}By default a converter co-emits only `skos:exactMatch` entries; entries whose `predicate_id` is `skos:closeMatch`/`broadMatch`/`narrowMatch`/`relatedMatch` SHOULD NOT be co-emitted unless a consumer explicitly requests it, since such a triple asserts a broader, narrower or merely related relation, not that the value holds under the synonym property, so the requester takes responsibility for that reading.

**Override under composition.** The dict is keyed by IRI and resolved by the [merge and override model](#merge-and-override-model): most-derived-wins, with `null` removing an inherited mapping. Keys - and `predicate_id` / `mapping_set_id` values - are compared as expanded IRIs, so the compact (`skos:prefLabel`) and full (`http://www.w3.org/2004/02/skos/core#prefLabel`) forms of one IRI are a single key and override correctly across mixed notations.

:::example{title="A subclass dropping an inherited mapping"}
```json
{
  "x-oold-context": {
    "description": { "rdfs:comment": null }
  }
}
```
:::

**SSSOM round-trip.** Each entry is one [SSSOM](https://w3id.org/sssom/) mapping row: `subject_id` implicit, `object_id` the synonym IRI, and `predicate_id` / `mapping_set_id` / `confidence` / `mapping_justification` / `object_source*` / ... the SSSOM slots defined by the SSSOM LinkML schema at `https://w3id.org/sssom/`. Entries sharing a `mapping_set_id` reconstitute one SSSOM mapping set; the propagatable `object_source` / `object_source_version` slots pin each mapping to the ontology version it was validated against and, like the rest of the context, propagate from a parent schema's declaration to inherited mappings under [composition](#composition). SSSOM is the recommended carrier for this metadata, not a normative dependency: OO-LD fixes only the SKOS meaning of `predicate_id` and the selection role of `mapping_set_id`, and the remaining slots ride along untouched, so SSSOM may evolve without affecting OO-LD. A bare SKOS predicate with no metadata, or a richer carrier (statement-level RDF-star, PROV for provenance), serves equally where SSSOM is not wanted.

Conversely, several context terms mapping to **one** IRI normalize syntactically non-interoperable input keys onto a single predicate - the complement of one term carrying several IRIs. Combined with `@reverse` and [framing](#framing), this turns a dataset whose records report the same relation in different ways into a consistent unified graph.

:::example{title="Normalizing a syntactically non-interoperable dataset"}
Input - the same relation is reported in three ways: two forward keys (`works_for`, `works_for_alt`) mapping to one predicate, and a backward `employees` mapped with `@reverse`:

{{ inline_file('examples/spec/normalize-input.json') }}

Normalized - a single, consistent representation:

{{ inline_file('examples/spec/normalize-output.json') }}
:::

#### Framing {#framing}

[JSON-LD 1.1 Framing](https://www.w3.org/TR/json-ld11-framing/) reshapes a flat or arbitrarily-structured RDF graph into a specific tree layout described by a *frame*. An OO-LD schema already describes exactly such a tree - its `properties` give the nesting, its `@context` gives the term IRIs, a type constant (`x-oold-instance-rdf-type`, or a `const` on the `type` property) gives the node type, and [`x-oold-range`](#range-of-properties) gives the type of embedded or referenced objects - so an OO-LD-aware tool MAY auto-construct a frame from the schema. Framing an instance graph with that frame produces a JSON document shaped like the schema, which then validates against the same schema.

This makes an OO-LD schema bidirectional: its `@context` drives expansion (JSON to RDF), and the frame derived from its structure drives framing (RDF back to the schema's JSON tree). :rule[OOLD-EXT-68fa]{applies=implementation level=MUST summary="A frame derived from a schema takes its @type from the class type, embeds inlined object properties as subframes and keeps reference-valued properties as IRIs with @embed @never."}A tool that derives a frame MUST derive it mechanically: the schema's class type becomes the frame `@type`; an inlined object property becomes a nested subframe that embeds the referenced node; a reference-valued property (including one whose term is mapped with JSON-LD `@reverse`) becomes a subframe with `@embed: @never` so its targets stay IRIs, in line with the inline-versus-reference choice `x-oold-range` already records; and `@explicit` / `@requireAll` / `@default` follow from `additionalProperties` and `required`. The frame's `@context` is the composition of the referenced schemas' contexts.

:::example{title="RDF to OO-LD schema to frame to instance"}
An input RDF graph (Turtle) - an organization with an address, and two persons who work for it:
```turtle
@prefix schema: <http://schema.org/> .
@prefix ex: <https://example.org/> .

ex:org1  a schema:Organization ; schema:address ex:addr1 .
ex:addr1 a schema:PostalAddress ; schema:postalCode "10115" .
ex:p1    a schema:Person ; schema:worksFor ex:org1 .
ex:p2    a schema:Person ; schema:worksFor ex:org1 .
```

The OO-LD schema for `Organization` - `address` is an inlined object (`$ref`, reflected as a scoped `@context`), and `employees` is a regular property whose `@context` term is mapped with JSON-LD `@reverse` to the persons' `schema:worksFor`, so listing an employee here yields a `worksFor` triple on that person:
```json
{
  "@context": {
    "schema": "http://schema.org/",
    "type": "@type",
    "id": "@id",
    "address": { "@id": "schema:address", "@context": "Address.schema.json" },
    "employees": { "@reverse": "schema:worksFor", "@type": "@id" }
  },
  "$id": "Organization.schema.json",
  "x-oold-instance-rdf-type": ["schema:Organization"],
  "type": "object",
  "properties": {
    "address": { "$ref": "Address.schema.json" },
    "employees": {
      "type": "array",
      "items": { "type": "string", "x-oold-range": "Person.schema.json" }
    }
  }
}
```

referencing minimal `Address` and `Person` stubs:
```json
{
  "@context": { "schema": "http://schema.org/", "type": "@type", "id": "@id", "postalCode": "schema:postalCode" },
  "$id": "Address.schema.json",
  "x-oold-instance-rdf-type": ["schema:PostalAddress"],
  "type": "object",
  "properties": { "postalCode": { "type": "string" } }
}
```
```json
{
  "@context": { "schema": "http://schema.org/", "type": "@type" },
  "$id": "Person.schema.json",
  "x-oold-instance-rdf-type": ["schema:Person"],
  "type": "object"
}
```

(This uses `@reverse` on an ordinary property - a read projection. The editor-only [`x-oold-reverse-properties`](#reverse-properties) affordance is different: it lets a user edit `employees` from the `Organization` while the relation is stored on the `Person` objects.)

The frame derived from that schema reuses the schema as its `@context`, embeds the address, and keeps employees as IRIs:
```json
{
  "@context": "Organization.schema.json",
  "type": "schema:Organization",
  "address": { "type": "schema:PostalAddress" },
  "employees": { "@embed": "@never" }
}
```

Framing the graph with that frame yields an OO-LD instance document, projected onto `ex:org1` with the `Address` inlined and the persons listed as `employees` IRIs via `@reverse`. Like any OO-LD instance it references its schema for both semantics (`@context`) and validation (`$schema`):
```json
{
  "@context": ["Organization.schema.json", { "ex": "https://example.org/" }],
  "$schema": "Organization.schema.json",
  "id": "ex:org1",
  "type": "schema:Organization",
  "address": {
    "id": "ex:addr1",
    "type": "schema:PostalAddress",
    "postalCode": "10115"
  },
  "employees": ["ex:p1", "ex:p2"]
}
```
:::

Framing is not the only option for this transformation. When the source data lives in a triplestore or behind a SPARQL endpoint, a [SPARQL](https://www.w3.org/TR/sparql11-query/) `CONSTRUCT` query - also derivable from the schema - can select and reshape the relevant subgraph directly, including deriving reverse relations such as `employees` from the inverse of `schema:worksFor`; compacting that result with the schema's `@context` (and framing it where nesting is required) yields the same OO-LD instance.

### JSON Schema {#jsonschema-extensions}

OO-LD targets [[JSONSCHEMA]] (2020-12) as its normative dialect. :rule[OOLD-EXT-5184]{applies=document level=SHOULD summary="A schema should declare the OO-LD dialect meta-schema as its $schema."}An OO-LD schema SHOULD declare the OO-LD dialect meta-schema (which extends 2020-12) as its `$schema`, e.g. `"$schema": "https://oo-ld.org/latest/meta/oold-meta-schema.json"` - pinning a specific version (e.g. `.../0.4.0/meta/oold-meta-schema.json`) for reproducibility. Declaring the plain 2020-12 meta-schema (`https://json-schema.org/draft/2020-12/schema`) remains valid for tools that only understand standard JSON Schema.

:rule[OOLD-EXT-af50]{applies=document level=REQUIRED summary="JSON Schema 2020-12 is required as the dialect, because composition places $ref alongside sibling keywords."}2020-12 is REQUIRED, not merely preferred: OO-LD's composition places `$ref` alongside sibling keywords (e.g. a property carrying `type`, `x-oold-range` and `@context`, or `allOf: [{$ref: ...}]` next to `properties`). Keywords adjacent to `$ref` are only evaluated from JSON Schema 2019-09 onward; in Draft 4 and Draft 7 they are ignored ([[JSONSCHEMA]] §8.2.3.1). Keywords such as `const` (used throughout this document) are likewise only available from draft-06 onward. Migration from the earlier Draft-4-style notation: rename `definitions` to `$defs`, `id` to `$id`, and use the numeric form of `exclusiveMinimum`/`exclusiveMaximum` instead of the boolean form.

#### Enum names and descriptions {#enum-names}

An `enum` constrains a property to a fixed set of values. Those values are data, chosen for what they mean on the wire, so they are routinely not usable as identifiers in generated code: an IRI, a CURIE, a value carrying spaces or hyphens, or a number. Two established vendor extensions carry the missing information, each a list positionally aligned with `enum`:

- **`x-enum-varnames`** - the identifier-safe name of each value, used as the generated enum member name.
- **`x-enum-descriptions`** - the documentation of each value, used as the generated member's doc comment.

Both keep their unprefixed names deliberately. Unlike the rest of OO-LD's vocabulary these keywords are not OO-LD's to name: they are read today by OpenAPI Generator and by several TypeScript generators, and the only reason to emit them is that those tools already understand them. A `x-oold-`-prefixed spelling would be read by nothing (see [](#meta-schema)).

Neither spelling is standardized - the [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3.html#specification-extensions) defines no enum-naming keyword, only the `x-` extension mechanism itself, and both pairs are conventions of generator tooling - so this is a choice between conventions rather than a deferral to an authority. OO-LD emits the OpenAPI Generator form, `x-enum-varnames` / `x-enum-descriptions`, for two reasons: it is read by the widest set of generators, and it is kebab-case like every other keyword in this vocabulary, where `x-enumNames` / `x-enumDescriptions` (NSwag, NJsonSchema) would be the only camelCase names in it. A reader MAY additionally recognize those alternates, and a writer targeting a .NET toolchain MAY emit them alongside.

:rule[OOLD-EXT-b249]{applies=document level=SHOULD summary="An enum whose values are not all valid identifiers should declare x-enum-varnames."}Where any `enum` value is not a valid identifier in the target language, the schema SHOULD declare `x-enum-varnames`, because each generator otherwise applies its own mangling: the member name becomes toolchain-dependent, and two values differing only in characters the mangling strips can collapse onto a single member. Where every value is already a valid identifier the keyword MAY be omitted, since a generator derives the same names from the values.

`x-enum-descriptions` carries documentation that cannot be derived from the value at all, so it is unconditional and is omitted only where there is nothing to say.

Three keywords serve two generators. **Code generation** uses `x-enum-varnames` for the member name and `x-enum-descriptions` for that member's doc comment. **Form generation** uses a keyword of its own for the option label, [`x-oold-ui-enum-titles`](#ui-generation): :rule[OOLD-EXT-b23b]{applies=implementation level=SHOULD summary="A form generator labels an option with x-oold-ui-enum-titles where the schema gives it, and may show x-enum-descriptions as further explanation."}a form generator SHOULD label each option with [`x-oold-ui-enum-titles`](#ui-generation) where the schema gives it, and MAY additionally present `x-enum-descriptions` as further explanation - help text or a tooltip beside the option - rather than as the label itself.

#### Multilanguage support {#multilanguage}

There are two distinct localization concerns: translating a schema's own annotations, and translating a value carried by an instance.

##### Localizing schema annotations {#localizing-schema-annotations}

The JSON Schema annotation keywords `title` and `description` carry a single, default human-readable string used by tooling (for example for UI generation). To provide localized variants, OO-LD adds the keywords `x-oold-multilang-title` and `x-oold-multilang-description`. :rule[OOLD-EXT-ef09]{applies=document level=MUST summary="x-oold-multilang-title/description must map BCP 47 language tags to translated strings."}Their value MUST be an object whose keys are [BCP 47](https://www.rfc-editor.org/info/bcp47) language tags (e.g. `en`, `de`, `en-GB`) and whose values are the translated strings. :rule[OOLD-EXT-dd76]{applies=document level=SHOULD summary="A schema using multilingual annotations should still provide a default title and description."}A schema SHOULD still provide a default `title` / `description`; a consumer that has no entry for the requested language falls back to that default. :rule[OOLD-EXT-44bd]{applies=implementation level="MUST NOT" summary="The multilang schema-annotation keywords label the schema, so they must not be interpreted as JSON-LD."}These keywords localize the schema's *own* labels and MUST NOT be interpreted as JSON-LD.

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

:rule[OOLD-EXT-6312]{applies=document level="MUST NOT" summary="The multilang keywords must not be used to localize an instance value; the standard JSON-LD mechanism is used instead."}To localize a *value of an instance* - a translatable string in the data that should round-trip to language-tagged RDF literals - the keywords above MUST NOT be used; the standard JSON-LD mechanism MUST be used instead. There are two equivalent JSON-LD-native ways to carry such a value, both producing the same language-tagged literals.

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

JSON Schema itself supports linked data only in the form of a subobject; references to independent external objects are just URL-strings without further restrictions. To express constraints on the type of the referenced object - as in OWL and SHACL - the keyword `x-oold-range` is introduced (see also [json-schema-org/json-schema-vocabularies#55](https://github.com/json-schema-org/json-schema-vocabularies/issues/55)). :rule[OOLD-EXT-c77a]{applies=document level=MUST summary="An x-oold-range takes one of three forms: an IRI, an array of IRIs, or a subschema."}Its value MUST take one of three forms, and no other:

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
intersections (`allOf`) and inline constraints can be combined to describe an anonymous subclass. :rule[OOLD-EXT-3fe9]{applies=document level=MUST summary="References inside x-oold-range must use x-oold-ref, never $ref."}References to other schemas inside `x-oold-range` MUST use `x-oold-ref`, never `$ref` (see below). The single-IRI form (1) is a shorthand for `{ "allOf": [ { "x-oold-ref": "Organization.schema.json" } ] }`:

:::example{title="Range as a subschema (Organization located in Germany)"}
```json
{
  "works_for": {
    "type": "string",
    "x-oold-range": {
      "allOf": [
        { "x-oold-ref": "Organization.schema.json" },
        { "properties": { "address": { "properties": { "country": { "const": "DE" } } } } }
      ]
    }
  }
}
```
:::

A range subschema MAY also carry additional annotations (e.g. `title`, `description` or further `x-oold-*` keywords) to support tooling - for example a human-readable label for an autocomplete dropdown, or hints used when generating a SHACL shape.

This includes `examples` and `default`, and where they sit decides what they describe. A JSON Schema annotation describes the value at its own location, so on a *reference* property - whose value is an IRI string - `examples` and `default` are example **references**, not descriptions of the target: an object there does not validate against the property's own `type: "string"`. To illustrate or seed the referenced object instead, put `examples` / `default` **inside** `x-oold-range`, where the subschema describes the target. Because `x-oold-range` is not auto-resolved (see [](#why-x-oold-ref)), such values never become the property's own value; a form generator MAY use them to prefill a newly created target. For an *embedded* object property the question does not arise - the value at that location is the object, so its annotations describe it directly.

An `x-oold-range` value is a *reference*: the property holds the target's IRI, and an OO-LD-aware loader MAY dereference that IRI to obtain the target document itself, so a large or shared object can live in a separate document and be pulled in on demand (*data bundling*). :rule[OOLD-EXT-ece0]{applies=document machine_checkable=no level=SHOULD summary="A published reference should point at a target that validates against the property's declared range."}A published reference SHOULD point at a target that validates against the property's declared range. :rule[OOLD-EXT-391e]{applies=implementation level=MUST summary="A loader that dereferences a target validates it against the declared range and does not assume the target conforms."}A loader that dereferences a target MUST validate it against that range before treating it as a member, and MUST NOT assume the target conforms, since the target is a separate document that may change independently of the reference. This holds whether the reference is written as a bare IRI string or as a `{ "@id": … }` object; generic tooling leaves it unresolved, exactly as it leaves `x-oold-ref` (see [](#why-x-oold-ref)).

##### Lexical form of the reference {#range-reference-form}

The value of an IRI-valued property is a JSON string. Its role as a reference comes from the `@context` (`"@type": "@id"`) and its class from `x-oold-range`. :rule[OOLD-EXT-6ea3]{applies=document level=SHOULD summary="An IRI-valued property should constrain its lexical form with an IRI/URI-family format."}Its *lexical* form SHOULD be constrained with an IRI/URI-family `format` so that malformed values are rejected; the choices, from most to least permissive:

- **Any IRI reference** - `"format": "iri-reference"`. :rule[OOLD-EXT-1f92]{applies=document machine_checkable=no level=RECOMMENDED summary="iri-reference is the recommended default format for an IRI-valued property."}By [[RFC3987]] this accepts absolute IRIs, compact IRIs (`ex:alice`, `schema:Person`) and context-relative references alike - the forms OO-LD instances routinely use - so it is the **RECOMMENDED** default. It also accepts a bare term such as `alice`, expanded against the context's `@base` / `@vocab`.
- **Absolute IRIs only** - `"format": "iri"`. A compact IRI is itself a valid absolute IRI (scheme `ex`, path `alice`), so `iri` accepts `ex:alice`; choose it to additionally forbid relative references.
- **Stricter, ASCII only** - `"format": "uri"` or `"uri-reference"`, where values are known not to use internationalized (non-ASCII) IRIs.
:rule[OOLD-EXT-2b61]{applies=document level=MUST summary="A compact-IRI prefix used by a property must be defined in the @context."}- **Compact form specifically** - a `"pattern"` such as `"^[A-Za-z_][\\w.-]*:(?!//)\\S*$"`, which accepts `ex:alice` and `schema:Person` while rejecting `http://…`; the prefix MUST be defined in the `@context`.

##### Value-term aliases (`@vocab`) {#value-term-aliases}

The [synonym machinery](#synonyms) keys `x-oold-context` by *term*, so it reaches property and class terms but not IRIs that appear as instance *values* - for example the unit IRIs a quantity property points at, where two widely used unit vocabularies name the same unit differently: QUDT `http://qudt.org/vocab/unit/SEC` and the [Ontology of units of Measure](https://github.com/HajoRijgersberg/OM) `http://www.ontology-of-units-of-measure.org/resource/om-2/second`. Coercing the property with `"@type": "@vocab"` (rather than `"@type": "@id"`) closes the gap: a string value is then resolved against the active context's terms before the base IRI, so declaring the unit as a value term (`"second": "http://qudt.org/vocab/unit/SEC"`) lets an instance write the readable `"second"` while the same `x-oold-context` synonyms and profile selection alias it (`"x-oold-context": { "second": { "om:second": { … } } }`); full IRIs remain valid values. Individual mappings round-trip through SSSOM like any other.

Because `@vocab` expands an unmatched string against the vocabulary - concatenating it onto the default vocabulary base when one is set (minting a new IRI), or leaving it a relative IRI when none is - a typo silently becomes a stray IRI rather than an error. :rule[OOLD-EXT-fdd8]{applies=document level=SHOULD summary="A property coerced @type @vocab should constrain its values with an enum or x-oold-range."}A property coerced `"@type": "@vocab"` therefore SHOULD constrain its values with an `enum` of the value terms (optionally named with `x-enum-varnames`) or with `x-oold-range`, so only intended individuals are accepted. :rule[OOLD-EXT-2542]{applies=document level=SHOULD summary="Value terms should not collide with JSON-LD keyword aliases or other context terms."}The value terms SHOULD also be kept from colliding with JSON-LD keyword aliases (`id`, `type`) or other context terms, since a value term shares the context's global term namespace - a term added for a value would otherwise also rewrite a property or keyword of the same name. Confining the value terms to the property's own scoped `@context` keeps them out of that shared namespace, since they then resolve only for that property's values; naming them with opaque identifiers such as UUIDs avoids the clash where readability is not required.

##### Why `x-oold-ref` and not `$ref` {#why-x-oold-ref}

`x-oold-range` is a custom keyword, so a `$ref` placed inside it is undefined behavior for generic JSON Schema tooling ([[JSONSCHEMA]] §9.4.2). In practice the behavior is not merely undefined but inconsistent: generic reference resolvers eagerly inline such a `$ref`, and because `x-oold-range` targets can form a cyclic graph of schemas this can pull in an unbounded graph, while schema-aware bundlers instead drop it.

`x-oold-ref` avoids this. Generic tools only follow the standard `$ref` keyword, so they leave `x-oold-ref` untouched. :rule[OOLD-EXT-6007]{applies=implementation level=SHOULD summary="An OO-LD-aware tool resolves x-oold-ref lazily and handles a cyclic reference graph by terminating rather than recursing indefinitely."}An OO-LD-aware tool SHOULD resolve `x-oold-ref` lazily, and MUST handle a cyclic reference graph - terminating and returning the references it has already resolved, rather than recursing indefinitely - since the graph it opts into may be unbounded or self-referential. The standard `$ref` continues to be used for ordinary schema composition (`allOf`, `properties`, `$defs`), which bundlers are expected to resolve. Because the only difference is the keyword name, the mapping is reversible: an OO-LD-aware tool can mechanically replace `x-oold-ref` with `$ref` to obtain a plain, fully-resolvable JSON Schema - the explicit opt-in to resolving the (possibly cyclic) graph.

##### Generation targets {#range-generation-targets .informative}

`x-oold-range` (and the reverse properties below) exist so that the logical and conceptual modelling layers can be generated from the same OO-LD source instead of being maintained separately: a range constrains the type of a referenced object, which an OO-LD-aware tool emits as a [SHACL](https://www.w3.org/TR/shacl/) property shape (`sh:class` / `sh:node`) and as an OWL property restriction. [SHACL 1.2](https://www.w3.org/TR/shacl12-core/) (in progress, including Node Expressions for derived values) and OWL are the intended targets. These are generation targets, not additional validation performed by generic JSON Schema tools.

#### Reverse properties {#reverse-properties}

Many relations are symmetric (e.g. Organization employs Person ⇔ Person works for Organization) and users want to edit them from both sides, without storing the information twice. The keywords `x-oold-reverse-properties` and `x-oold-reverse-required` declare such a [=reverse property=], mapped with JSON-LD `@reverse` in the `@context`. (The earlier `x-oold-reverse-default-properties` array is deprecated: mark a reverse property shown by default with `x-oold-ui-default-property` on the property itself - see [](#ui-generation) - which, unlike the merged array, is overridable under composition.) To make `employees` the reverse of `works_for`:

- define `works_for` in the `properties` of `Person`, mapped to a semantic property (`schema:worksFor`) in the `@context` of `Person`;
- define `employees` in `x-oold-reverse-properties` of `Organization`, mapped with `@reverse` to the same property in the `@context` of `Organization` ([[JSON-LD11]] reverse properties).

:::example{title="Reverse property across two schemas"}
`Organization.schema.json` declares `employees` as the reverse property (the `address` composition and `Thing` inheritance are unrelated to this demonstration):

{{ example('Organization') }}

`Person.schema.json` carries the forward `works_for` property:

{{ example('Person') }}
:::

:rule[OOLD-EXT-eeda]{applies=implementation level=MUST summary="An implementation supporting reverse properties reads them from, and writes an edit back to, the forward property on the referenced object."}An implementation that supports reverse properties MUST read and modify them on the object that actually stores them: loading an `Organization` editor prepopulates `employees` by querying which persons work for it; storing the `Organization` writes it into each referenced person's `works_for` field; and removing a person from `employees` removes the organization from theirs.

#### UI Generation {#ui-generation}

OO-LD schemas double as the source for auto-generated forms and views. UI intent is carried in two layers:

- Portable, renderer-agnostic keywords in the `x-oold-ui-*` vocabulary, defined here. Any form generator can honour them.
- Renderer-specific keywords passed through under a vendor prefix - `x-jedison-*` for [jedison](https://github.com/germanbisurgi/jedison), the successor of [json-editor](https://github.com/json-editor/json-editor) - for options that do not generalize.

Every keyword keeps the `x-` prefix, so it is a valid JSON Schema extension keyword and a valid OpenAPI 3.0 specification extension. Per JSON Schema 2020-12, unknown keywords are annotations and are ignored for validation; a validator that defaults to a stricter mode (for example Ajv's `strict`) may reject them, so it is run in non-strict mode or with the keywords registered. The `x-oold-ui-*` keywords form their own optional dialect, described by the [OO-LD UI meta-schema](../meta/oold-ui-meta-schema.json); the core meta-schema includes those definitions so an OO-LD schema carrying UI annotations validates in one pass.

The W3C SHACL 1.2 [User Interfaces](https://www.w3.org/TR/shacl12-ui/) module (First Public Working Draft, 2026) describes the same concern - form and view generation - for RDF graphs. `x-oold-ui-*` is the portable counterpart for the physical (JSON Schema) layer: it rides on JSON Schema and therefore needs no RDF toolchain, while SHACL 1.2 UI targets a SHACL shapes graph. The two are intended to be a crosswalk rather than competing vocabularies. Candidate mappings for the `x-oold-ui-*` vocabulary follow (`sh:` = SHACL core, `shui:` = SHACL UI; SHACL 1.2 UI is a First Public Working Draft, so entries marked *tentative* may still change):

| `x-oold-ui-*` keyword | SHACL 1.2 UI candidate |
| --- | --- |
| `x-oold-ui-property-order` | `sh:order` |
| `x-oold-ui-property-group` | `sh:group` (a `sh:PropertyGroup`) |
| `x-oold-ui-widget` (and `format`) | `shui:editor` / `shui:viewer` with a widget class (`shui:AutoCompleteEditor`, `shui:EnumSelectEditor`, `shui:DatePickerEditor`, `shui:BooleanEditor`, `shui:TextFieldEditor`, `shui:ImageViewer`, `shui:ValueTableViewer`, ...) |
| `x-oold-ui-hint` | `sh:description` (help text) |
| `x-oold-multilang-ui-hint` | `sh:description` with language-tagged strings |
| `x-oold-ui-enum-titles` | `rdfs:label` on each `sh:in` value, rendered by `shui:EnumSelectEditor` |
| `x-oold-multilang-ui-enum-titles` | language-tagged `rdfs:label` on each `sh:in` value |
| `x-oold-ui-form-hidden` | suppress `shui:editor` *(tentative)* |
| `x-oold-ui-render-hidden` | suppress `shui:viewer` *(tentative)* |
| `x-oold-ui-default-property` | no direct counterpart; a `shui:propertyRole` / default-visibility convention *(tentative)* |

The OO-LD UI meta-schema MAY itself carry a JSON-LD `@context` recording these term identities, so the vocabulary is self-describing.

##### The `x-oold-ui-*` vocabulary {#ui-vocabulary}

All keywords apply to the (sub)schema of a single property.

{{ render_schema('meta/oold-ui-meta-schema.json') }}

The text-valued keywords have a `x-oold-multilang-*` variant carrying a BCP-47 language map, mirroring `x-oold-multilang-title` (see [](#localizing-schema-annotations)): `x-oold-multilang-ui-hint` and `x-oold-multilang-ui-enum-titles`.

`x-oold-ui-enum-titles` holds human display labels for a form, and is distinct from the code-generation keywords `x-enum-varnames` and `x-enum-descriptions`, which are specified in [](#enum-names).

`x-oold-ui-default-property` replaces the json-editor `defaultProperties` array (which listed the optional properties shown initially). That array is *extend-only* under composition: because composed schemas merge the arrays, a derived schema can add a default property but cannot switch one off. A per-property boolean is *overridable* - it resolves most-derived-wins (see [](#merge-and-override-model)), so a derived schema sets it to `false` to hide a property a base schema showed. For the same reason `x-oold-reverse-default-properties` is deprecated in favour of `x-oold-ui-default-property` on the reverse property.

##### Widget hints: `format` vs `x-oold-ui-widget` {#widget-hints}

`format` carries the widget hint when its value is a registered JSON Schema 2020-12 format (`date`, `date-time`, `time`, `duration`, `email`, `uri`, `iri`, `uuid`, ...); a validator may check it and a form generator picks the matching input. :rule[OOLD-EXT-1e3c]{applies=document level=MUST summary="A widget hint that is not a registered format goes in x-oold-ui-widget, leaving format for validation."}A value that is not a registered format (`table`, `tabs`, `grid`, `autocomplete`, `textarea`, `checkbox`, `markdown`, `color`, ...) is widget-only and MUST be carried in `x-oold-ui-widget` rather than `format`, which stays a validation assertion: a validator that checks declared formats would otherwise reject every value of the property.

##### Validator vs. form widget {#validator-vs-widget .informative}

A modern JSON Schema 2020-12 toolchain - ajv, the json-editor / jedison built-in validator, Hyperjump, Pydantic v2, OpenAPI 3.1 - honours `const` and keywords placed alongside `$ref`, so OO-LD's composition constructs validate as written; the older assumption that such tooling silently drops them does not hold for these validators. A narrower caveat concerns UI generation rather than validation: a form generator's *widget rendering* of a keyword may differ from what its *validator* enforces - for example json-editor validates `const` but does not necessarily render the field as a fixed value. A consumer restricted to a Draft-4-only JSON Schema processor remains the exception, since keywords adjacent to `$ref` and `const` are only guaranteed from later drafts.

##### Delivery: inline or overlay {#ui-delivery}

UI keywords may be embedded in the schema (inline):

{{ example('UiAnnotations') }}

or applied by an *overlay* - a separate document that patches a schema without editing it, following the [OpenAPI Overlay 1.1.0](https://spec.openapis.org/overlay/latest.html) model. Overlays are a general schema-patching mechanism: the `update` actions can inject any keywords (semantics, constraints or presentation), and applying `x-oold-ui-*` annotations is one use case - useful when the schema is generated or owned elsewhere, or when one schema needs different presentation in different contexts. An overlay lists `actions`, each selecting nodes with an [RFC 9535 JSONPath](https://www.rfc-editor.org/rfc/rfc9535) `target` and merging keys via `update` (or removing them via `remove`):

{{ inline_file('examples/UiOverlay.json') }}

The vendor keywords are documented by their respective projects: jedison's `x-jedison-*` (see [germanbisurgi/jedison#58](https://github.com/germanbisurgi/jedison/issues/58) and the overlay proposal [#59](https://github.com/germanbisurgi/jedison/issues/59)) and, for schemas coming from OpenSemanticLab, the server-side `x-osl-*` keywords. Migrating a legacy OpenSemanticWorld schema to these keywords is covered in the [migration guide](../migration/from-legacy-osw/).

### Semantic delivery {#semantic-delivery}

An OO-LD schema carries its semantics in the top-level `@context` and, for the RDF type of instances, in `x-oold-instance-rdf-type`. How those reach a consumer depends only on which keywords the consumer tolerates. The native form is preferred; the alternatives below are mechanically generated from it, so the OO-LD document remains the single source and every form yields the same RDF.

:rule[OOLD-EXT-61aa]{applies=implementation level=SHOULD summary="A consumer accepting arbitrary JSON Schema keywords should receive the native form unchanged."}- A consumer that accepts arbitrary JSON Schema keywords SHOULD receive the native form unchanged. This covers plain JSON Schema 2020-12 validators, OpenAPI 3.1, and - because they place no restriction on `@context` - Model Context Protocol tool schemas (`inputSchema` / `outputSchema`) as well as LLM tool-use and structured-output APIs, which carry the context through and can use it as grounding.
- :rule[OOLD-EXT-436a]{applies=implementation level=SHOULD summary="For OpenAPI 3.0, deliver the context and type per class as vendor extensions."}For OpenAPI 3.0, which rejects unprefixed keywords in a Schema Object (and typically bundles several classes with no document root to host one `@context`), the context and type SHOULD be delivered per class as `x-jsonld-context` and `x-jsonld-type` following [REST API Linked Data Keywords](https://datatracker.ietf.org/doc/html/draft-polli-restapi-ld-keywords-08): `@context` maps to `x-jsonld-context` and `x-oold-instance-rdf-type` to `x-jsonld-type`. That draft requires references inside these keywords not to be dereferenced automatically, consistent with the `x-oold-ref` rule (see [](#why-x-oold-ref)). The mapping is reversible, so such an export can be read back into an OO-LD schema.
- For a strict structured-output subset that rejects unknown keywords entirely, the relevant IRIs MAY instead be folded into the `title` / `description` annotations the model also reads. Such a subset typically also constrains the JSON Schema itself (closed objects, all-required properties, limited composition), so the delivery step may apply a small structural transform - for example flattening an `allOf` inheritance chain - in addition to folding the IRIs; the semantics still originate in the single OO-LD source.

Worked examples of each tier, including the per-class OpenAPI 3.0 mapping, are given in the guide (see [Delivery to OpenAPI, MCP and LLM tooling](../use-cases/)).
