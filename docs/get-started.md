# Get Started

This page walks you through the smallest possible OO-LD schema, step by step. If you are not familiar yet with [JSON Schema](https://json-schema.org/) or [JSON-LD](https://json-ld.org/), you may first want to look at dedicated tutorials like the [OSW JSON Schema Tutorial](https://opensemantic.world/wiki/Item:OSWf4a9514baed04859a4c6c374a7312f10) and the [OSW JSON-LD Tutorial](https://opensemantic.world/wiki/Item:OSW911488771ea449a6a34051f8213d7f2f).

## Step 1 - Write a schema that is also a context

The core idea of OO-LD is that a single document is at once a valid **JSON Schema** and a reference-able **JSON-LD remote context**. Start from a plain JSON Schema and add an `@context`:

{{ example('Minimal') }}

- The JSON Schema part (`type`, `properties`, …) describes the **structure** of the object.
- The `@context` part maps the `name` property to the semantic term `schema:name`, describing its **meaning**.
- `$id` gives the schema a stable identity and `$schema` declares the OO-LD dialect (the meta-schema).

## Step 2 - Try it in the playground

You can explore this exact example - validation, UI generation, and RDF output - in the [interactive playground](https://oo-ld.github.io/playground/).

## Step 3 - Validate schemas in this repository

This repository ships example schemas under [`examples/`](https://github.com/OO-LD/oold-schema/tree/main/examples) and the OO-LD meta-schema under [`meta/`](https://github.com/OO-LD/oold-schema/tree/main/meta). To validate them locally:

```bash
npm install
npm run validate
```

## Next steps

- [Basic Concepts](guide/basic-concepts.md) - how a schema doubles as a context, and how inheritance works.
- [Composition](guide/composition.md) - assemble complex types from reusable building blocks.
- [Schema Instances](guide/schema-instances.md) - how instance documents reference their schema and carry identity and type.
