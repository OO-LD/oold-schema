# Composition

Composition is how an OO-LD schema builds a complex type from several independent schemas - for example attaching a geolocation schema and a contact schema to one resource type - without needing a shared parent class. Each referenced schema contributes both its JSON Schema `properties` (via `$ref`) and its JSON-LD term mappings (via `@context`).

The key idea: **every `$ref` is reflected into the `@context`** so the composed schema stays usable as a JSON-LD context with no post-processing. A `$ref` inside a `type: object` property becomes a property-scoped context; other `$ref`s are listed at the root. When several contexts define the same term, a most-recently-defined-wins rule applies.

For the full normative rules - the reflection rules, `oneOf`/`anyOf` handling, type- and property-scoped contexts, `@propagate`/`@protected`, base-URI alignment, and the **Merge and override model** - with worked examples, see [Composition](../spec/#composition) in the specification.
