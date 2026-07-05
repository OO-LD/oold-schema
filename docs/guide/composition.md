# Composition

Composition is how an OO-LD schema incorporates multiple independent schemas, each contributing its own properties and JSON-LD term mappings, without requiring a shared parent class. This lets you build complex types by assembling reusable building blocks - for example, attaching a geolocation schema and a contact schema to a single resource type. The rules below govern how the resulting `@context` is assembled automatically, so that no post-processing step is needed.

It MUST NOT be required to further process an OO-LD Schema document in order to interpret it as JSON-LD context. This implies that all occurrences of `$ref` in the schema are reflected in the JSON-LD context. `$ref` within properties of `type: object` MUST be listed as scoped JSON-LD context. `$ref` within all other property types and at the root level of the OO-LD schema MUST be listed at the root level of the JSON-LD context. In case of multiple `$ref` within `allOf` the corresponding remote contexts are merged into an array-valued `@context` (see [Merging remote contexts](#merging-remote-contexts)). For `oneOf` / `anyOf` this requires care to avoid conflicts (see [Merging remote contexts](#merging-remote-contexts)). At any time the importing OO-LD schema can define its own or override the imported JSON-LD context.

```yaml
"@context":
  - B.schema.json
  - P1.schema.json
  - p1:
    "@context": P1.schema.json
  - p2:
    "@context": 
      - P2a.schema.json
      - P2b.schema.json
  - p3:
    "@context":
      keyword_in_P3a: ex:Property1
      keyword_in_P3b: ex:Property2
$id: A.schema.json
allOf:
  - $ref: B.schema.json
properties:
  p0:
    type: string
    $ref: P0.schema.json
  p1:
    type: object
    $ref: P1.schema.json
  p2:
    type: object
    allOf:
      $ref: P2a.schema.json
      $ref: P2b.schema.json
  p3:
    oneOf:
      $ref: P3a.schema.json
      $ref: P3b.schema.json
```

<details> <summary>Full example</summary>

```yaml
"@context": 
  name: ex:petName
$id: Pet.schema.json
properties:
  name:
    type: string
```

```yaml
"@context": 
  name: schema:name
  pets:
    "@id": ex:hasPet
    "@context": Pet.schema.json
$id: Person.schema.json
properties:
  name:
    type: string
  pets:
    type: array
    items: 
      $ref: Pet.schema.json
```

```yaml
"@context": Person.schema.json
$schema: Person.schema.json
name: Max
pets:
  - name: Bruno
```

```yaml
"@context": 
  name: ex:name
  pets:
    "@id": ex:hasPet
    "@context":
      name: ex:petName
$schema: Person.schema.json
name: Max
pets:
  - name: Bruno
```

```ttl
_:b0 <ex:hasPet> _:b1 .
_:b0 <schema:name> "Max" .
_:b1 <ex:petName> "Bruno" .
```

</details>

## Merging remote contexts

**Multiple `$ref` (e.g. in `allOf`)** each correspond to a remote context. By the reflection rule above, the schema's own `@context` MUST list those remote contexts as an **array**, in the same order as the `allOf` members, so the schema stays usable as a context without further processing. A JSON-LD processor then resolves that array in order, later entries overriding earlier ones - "Duplicate context terms are overridden using a most-recently-defined-wins mechanism" ([JSON-LD 1.1, 4.1.5](https://www.w3.org/TR/json-ld11/#advanced-context-usage)). The schema MAY append its own context object as the last array entry to override an inherited term. The single-context `@import` keyword is an alternative only when exactly one remote context is wrapped and locally modified (it cannot contain a nested `@import`), so the array form is used for the multi-`$ref` case.

**`oneOf` / `anyOf`.** The remote contexts of `oneOf` / `anyOf` branches MAY also be reflected into the `@context`, but they MUST NOT conflict at the root - they MUST NOT map the same keyword to different IRIs there. A JSON-LD processor merges all listed contexts (most-recently-wins) and has no notion of which branch a given instance matched, so a root-level conflict would be decided by context order rather than by the branch the data conforms to.

Where branches genuinely need different mappings for the same keyword, do not place them at the root; scope them so each mapping applies only where its branch applies, using JSON-LD scoped contexts:

- **Type-scoped contexts** when the branches are distinguished by `@type`. The scoped `@context` is attached to the term used as the type value and is activated only for nodes carrying that `@type`:

  ```json
  {
    "@context": {
      "Sensor": { "@id": "ex:Sensor", "@context": { "reading": "ex:temperature" } },
      "Gauge":  { "@id": "ex:Gauge",  "@context": { "reading": "ex:pressure" } }
    }
  }
  ```

Here `{ "@type": "Sensor", "reading": 21 }` maps `reading` to `ex:temperature`, while `{ "@type": "Gauge", "reading": 3 }` maps the same keyword to `ex:pressure`.

- **Property-scoped contexts** when the conflicting keyword appears under different parent properties. The mapping is attached to the parent property's term (its `@context`) and applies only within that property's value, so the same keyword can resolve differently under different parents.

**Propagation (`@propagate`).** A `$ref` inside a `type: object` property is reflected as a property-scoped context, which by default propagates into the whole subtree rooted at that property ("By default ... contexts propagate across node objects, other than for type-scoped contexts, which default to false"). Where a referenced context should apply only to the immediate node, the schema MUST set `"@propagate": false` on that scoped context. Contexts combined in a single array MUST share the same `@propagate` value.

**Protected terms (`@protected`).** A schema MAY mark terms `@protected` to prevent later contexts from silently redefining them. When contexts are combined via `allOf`, redefining a protected term to a different IRI is an error unless the new definition is identical; property-scoped contexts are exempt and may override protected terms within their subtree. Relying on `@protected` therefore constrains which schemas a schema can be combined with.

**Independent references and base URIs.** A JSON Schema `$ref` and a JSON-LD `@context` entry are independent references: they MAY point to the same document (the typical OO-LD case, where one document is both a schema and a context) or to different documents - for example a plain JSON Schema referenced via `$ref` together with a separate remote `@context` that supplies the semantics. Relative references resolve against the schema's `$id` (the JSON Schema base URI) and, on the JSON-LD side, against `@base` / the retrieval URL; these base URIs SHOULD be aligned so a relative reference resolves to the same absolute URL under both. `$id` MUST NOT contain a non-empty fragment ([JSON Schema Core 8.2.1](https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.1)).

## Merge and override model

JSON Schema's validation algebra is purely conjunctive: `allOf` requires an instance to satisfy every subschema, and the specification defines no merge of the subschemas' keyword *values* ([JSON Schema Core 10.2.1.1](https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1.1)). Several consumers nonetheless require a single *resolved* view of a composed schema rather than a conjunction: a UI generator needs exactly one `title` per field, a code generator flattens an inheritance chain into one class, and an OO-LD preprocessor must produce one `@context`.

When such a merge is required, OO-LD resolves the `allOf` chain by applying **JSON Merge Patch ([RFC 7386](https://www.rfc-editor.org/rfc/rfc7386)) semantics**: keyed by object member, most-recently-defined (most-derived) wins, and a `null` value removes a key. For the `@context` this coincides with JSON-LD's own override rule ("Duplicate context terms are overridden using a most-recently-defined-wins mechanism", [JSON-LD 1.1, 4.1.5](https://www.w3.org/TR/json-ld11/#advanced-context-usage)). For assertion-bearing keywords the resolved view additionally honors **narrow-only** composition: a derived schema MAY restrict a constraint but MUST NOT relax it, matching how code generators let a subclass tighten - never loosen - a superclass property's validation.

This single model governs every place OO-LD collapses composition into a resolved value: single-valued annotations such as `title` and `x-oold-multilang-title` resolve most-derived-wins, constraints resolve narrow-only, and additive maps merge by key. A preprocessor applying it produces exactly the view that UI and code generators already compute, so no separate "resolved schema" format is needed.
