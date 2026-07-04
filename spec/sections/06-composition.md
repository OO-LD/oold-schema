## Composition {#composition}

Composition is how an [=OO-LD schema=] incorporates multiple independent
schemas, each contributing its own properties and JSON-LD term mappings,
without requiring a shared parent class. The rules below govern how the
resulting `@context` is assembled automatically, so that no
post-processing step is needed.

It MUST NOT be required to further process an OO-LD
schema document in order to interpret it as a JSON-LD context. This implies
that all occurrences of `$ref` in the schema are reflected in the
JSON-LD context. `$ref` within properties of `type: object`
MUST be listed as a scoped JSON-LD context.
`$ref` within all other property types and at the root level of the
OO-LD schema MUST be listed at the root level of the
JSON-LD context. In case of multiple `$ref` within `allOf`
the corresponding remote contexts are merged into an array-valued
`@context` (see [](#merging-remote-contexts)). For
`oneOf` / `anyOf` this requires care to avoid conflicts.
At any time the importing OO-LD schema MAY define its
own or override the imported JSON-LD context.

### Merging remote contexts {#merging-remote-contexts}

**Multiple `$ref` (e.g. in `allOf`)**
each correspond to a remote context. By the reflection rule above, the
schema's own `@context` MUST list those
remote contexts as an array, in the same order as the `allOf`
members, so the schema stays usable as a context without further
processing. A JSON-LD processor then resolves that array in order, later
entries overriding earlier ones - duplicate context terms are overridden
using a most-recently-defined-wins mechanism ([[JSON-LD11]] §4.1.5). The
schema MAY append its own context object as the
last array entry to override an inherited term.

**`oneOf` / `anyOf`.** The remote
contexts of `oneOf` / `anyOf` branches
MAY also be reflected into the `@context`,
but they MUST NOT conflict at the root - they
MUST NOT map the same keyword to different IRIs
there. Where branches genuinely need different mappings for the same
keyword, they are scoped using JSON-LD **type-scoped** or
**property-scoped** contexts so each mapping applies only where
its branch applies.

**Propagation (`@propagate`).** A `$ref`
inside a `type: object` property is reflected as a
property-scoped context, which by default propagates into the whole subtree
rooted at that property. Where a referenced context should apply only to the
immediate node, the schema MUST set
`"@propagate": false` on that scoped context. Contexts combined
in a single array MUST share the same
`@propagate` value.

**Protected terms (`@protected`).** A schema
MAY mark terms `@protected` to prevent
later contexts from silently redefining them. When contexts are combined via
`allOf`, redefining a protected term to a different IRI is an
error unless the new definition is identical; property-scoped contexts are
exempt and may override protected terms within their subtree.

**Independent references and base URIs.** A JSON Schema
`$ref` and a JSON-LD `@context` entry are independent
references: they MAY point to the same document
(the typical OO-LD case) or to different documents. Relative references
resolve against the schema's `$id` and, on the JSON-LD side,
against `@base` / the retrieval URL; these base URIs
SHOULD be aligned so a relative reference resolves
to the same absolute URL under both. `$id`
MUST NOT contain a non-empty fragment
([[JSONSCHEMA]] §8.2.1).

### Merge and override model {#merge-and-override-model}

JSON Schema's validation algebra is purely conjunctive: `allOf`
requires an instance to satisfy every subschema, and the specification
defines no merge of the subschemas' keyword values ([[JSONSCHEMA]]
§10.2.1.1). Several consumers nonetheless require a single
*[=resolved schema=]* view rather than a conjunction: a UI generator
needs exactly one `title` per field, a code generator flattens an
inheritance chain into one class, and an OO-LD preprocessor must produce one
`@context`.

When such a merge is required, OO-LD resolves the `allOf` chain by
applying **JSON Merge Patch ([[RFC7386]]) semantics**: keyed by
object member, most-recently-defined (most-derived) wins, and a
`null` value removes a key. For the `@context` this
coincides with JSON-LD's own override rule. For assertion-bearing keywords
the resolved view additionally honors **narrow-only**
composition: a derived schema MAY restrict a
constraint but MUST NOT relax it.
