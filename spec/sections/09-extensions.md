## Standard Extensions {#extensions}

### JSON-LD {#jsonld-extensions}

OO-LD targets [[!JSON-LD11]].

#### Processing mode (`@version`) {#processing-mode}

OO-LD composition relies on JSON-LD 1.1 features, in particular scoped
contexts. Generated OO-LD contexts SHOULD
therefore declare `"@version": 1.1` (the JSON number
`1.1`, not the string). Because the first encountered
`@version` entry determines the processing mode, it is
sufficient to declare it once in the base context of a composition.

#### Multi-Mapping {#multi-mapping}

JSON-LD allows only a single keyword-IRI mapping. As a workaround, an
additional context notation is provided: `<property>*(*)`
pointing to additional `@id` mappings, to document alternative
options or drive custom RDF generation. An OO-LD-aware converter
MAY produce redundant triples for interoperability.

### JSON Schema {#jsonschema-extensions}

OO-LD targets [[!JSONSCHEMA]] (2020-12) as its normative dialect. An OO-LD
schema SHOULD declare
`"$schema": "https://json-schema.org/draft/2020-12/schema"` (or an
OO-LD dialect meta-schema derived from it). 2020-12 is
REQUIRED, not merely preferred: OO-LD's composition
places `$ref` alongside sibling keywords, which are only evaluated
from JSON Schema 2019-09 onward.

#### Multilanguage support {#multilanguage}

There are two distinct localization concerns. To localize a schema's own
annotations, OO-LD adds `x-oold-multilang-title` and
`x-oold-multilang-description`, whose value
MUST be an object keyed by
[BCP 47](https://www.rfc-editor.org/info/bcp47) language tags.
To localize a *value of an instance*, the standard JSON-LD
mechanism is used instead (an explicit `@value`/`@language`
object, or a `@container: @language` language map).

#### Range of properties (`x-oold-range`) {#range-of-properties}

To express constraints on the type of a referenced object - as in OWL and
SHACL - the keyword `x-oold-range` is introduced. It takes one
of three forms: an IRI (string) referencing a single allowed target
schema; an array of IRIs (a union of allowed target schemas); or an OO-LD
subschema (the most expressive form, combining `anyOf` /
`oneOf` / `allOf` and inline constraints).
References to other schemas inside `x-oold-range`
MUST use `x-oold-ref`, never
`$ref`.

##### Why `x-oold-ref` and not `$ref` {#why-x-oold-ref}

`x-oold-range` is a custom keyword, so a `$ref`
placed inside it is undefined behavior for generic JSON Schema tooling
([[JSONSCHEMA]] §9.4.2). Generic tools only follow the standard
`$ref` keyword, so they leave `x-oold-ref`
untouched; OO-LD-aware tools resolve it deliberately and lazily, with
cycle detection. Because the only difference is the keyword name, the
mapping is reversible: an OO-LD-aware tool can mechanically replace
`x-oold-ref` with `$ref` to obtain a plain,
fully-resolvable JSON Schema.

#### Reverse properties {#reverse-properties}

Many relations are symmetric (e.g. Organization employs Person ⇔ Person
works for Organization) and users want to edit them from both sides. The
keywords `x-oold-reverse-properties`,
`x-oold-reverse-default-properties` and
`x-oold-reverse-required` declare such a
[=reverse property=], mapped with JSON-LD `@reverse` in the
`@context`. An OO-LD-aware implementation uses this to read and
modify properties that are actually stored in another object.

#### UI Generation {#ui-generation .informative}

Additional keywords defined by
[JSON Editor](https://github.com/json-editor/json-editor) may be
used to drive automatic user-interface (form) generation.
