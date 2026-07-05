# Basic Concepts

The core idea is that an OO-LD document is always both a valid JSON Schema and a reference-able JSON-LD remote context (not a JSON-LD document). In this way a complete OO-LD class / schema hierarchy is usable by JSON Schema-only and JSON-LD-only tools, while OO-LD-aware tools add features on top (UI autocomplete for IRI fields, SHACL shape or JSON-LD frame generation, ...).

A minimal example:

{{ example('Thing') }}

You can explore this in the [interactive playground](https://oo-ld.github.io/playground/).

## Schemas vs. instances

A **schema** is consumed as a JSON-LD *remote context* (referenced from an instance's `@context`), never expanded as a document. An **instance** *is* a JSON-LD document and is processed as such. This asymmetry is what lets one document act both as a JSON Schema `$ref` target and as a JSON-LD context.

## Inheritance

A class *B* extends a class *A* by referencing it in both `allOf` (so validators apply *A*'s rules to *B* instances) and `@context` (so JSON-LD resolves *A*'s term mappings); *B* instances are therefore valid *A* instances. See [Basic Concepts](../spec/#basic-concepts) in the specification for the inheritance diagram and the exact consumption rules. Building types from *multiple* independent schemas is covered in [Composition](composition.md).

You can read how this is implemented in OpenSemanticWorld/Lab in the [introduction](https://opensemantic.world/wiki/Item:OSWdb485a954a88465287b341d2897a84d6) and [schema documentation draft](https://opensemantic.world/wiki/Item:OSWab674d663a5b472f838d8e1eb43e6784).
