## Basic Concepts {#basic-concepts}

The core idea is that an [=OO-LD schema=] is always both a valid JSON Schema
and a reference-able JSON-LD [=remote context=] as defined in [[JSON-LD11]]
§3.1 (*not* a JSON-LD document). In this way a complete OO-LD class /
schema hierarchy is consume-able by JSON Schema-only and JSON-LD-only tools
while OO-LD-aware tools can provide extended features on top (e.g. UI
autocomplete dropdowns for string-IRI fields based on a SPARQL backend, or
SHACL shape / JSON-LD frame generation).

:::example{title="A minimal OO-LD schema"}
{{ example('Thing') }}
:::

There is an asymmetry between how schemas and instances are consumed:

- An [=OO-LD schema=] is consumed as a JSON-LD [=remote context=] (referenced by its URL from an instance's `@context`), never as a JSON-LD document. OO-LD schema documents MUST NOT be interpreted as JSON-LD documents, because that would apply the schema's own `@context` to the schema itself and produce incorrect triples.
- An [=OO-LD instance=] *is* a valid JSON-LD document and is processed as such.

This asymmetry is what lets a single document serve both as a JSON Schema
`$ref` target and as a JSON-LD remote `@context` for the
same resource. Concretely: an instance is processed directly as a JSON-LD
document (e.g. `jsonld.toRDF(instance)`), which loads the schema as
a remote context via the instance's `@context`; a schema is only
ever referenced as that context and MUST NOT itself
be expanded as a document.

:::note{title="Inheritance"}
A class *B* extends a class *A* by referencing it in both
`allOf` (so JSON Schema validators apply *A*'s rules when
validating *B* instances) and `@context` (so JSON-LD
processors resolve *A*'s term mappings). *B* instances are
therefore valid *A* instances and carry all of *A*'s properties
alongside *B*'s own additions. Building types from *multiple*
independent schemas is covered in [](#composition).
:::
