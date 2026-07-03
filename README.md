# OO-LD Schema

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.11401726.svg)](https://doi.org/10.5281/zenodo.11401726)

**The Object-Oriented Linked Data Schema, based on [JSON-LD](https://json-ld.org/) and [JSON Schema](https://json-schema.org/) — work in progress.**

OO-LD connects the structural modelling of objects and subobjects with the modelling of their semantic relations, without reinventing the wheel: a single OO-LD document is at once a valid **JSON Schema** and a reference-able **JSON-LD context**. You define the structure of your data and its meaning in one source, then reuse that schema for validation, RDF generation, code generation, user interfaces, and API definitions — using the JSON Schema and JSON-LD tooling you already have.

## A minimal example

```json
{
  "@context": {
    "schema": "http://schema.org/",
    "name": "schema:name"
  },
  "title": "Person",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "First and Last name"
    }
  }
}
```

The JSON Schema part (`type`, `properties`) describes the structure; the `@context` maps `name` to the semantic term `schema:name`. Try it in the [interactive playground](https://oo-ld.github.io/playground/).

## Documentation

📖 **Full documentation: <https://OO-LD.github.io/oold-schema/>**

The site covers the concepts and specification in an orientation-style guide with worked examples:

- [Introduction](https://OO-LD.github.io/oold-schema/introduction/) — what OO-LD is and why.
- [Get Started](https://OO-LD.github.io/oold-schema/get-started/) — a first hands-on example.
- [Guide](https://OO-LD.github.io/oold-schema/guide/) — basic concepts, composition, schema instances, identification & versioning, extensions, and the meta-schema.
- [Use Cases](https://OO-LD.github.io/oold-schema/use-cases/), [Mappings](https://OO-LD.github.io/oold-schema/mappings/), [Tooling](https://OO-LD.github.io/oold-schema/tooling/), and [Reference](https://OO-LD.github.io/oold-schema/reference/).

## Repository contents

- [`examples/`](examples/) — example OO-LD schemas (`Person`, `Organization`, `Address`, `Researcher`, `Thing`).
- [`meta/oold-meta-schema.json`](meta/oold-meta-schema.json) — the OO-LD dialect meta-schema.
- [`scripts/validate.mjs`](scripts/validate.mjs) — validates the example schemas against the meta-schema.
- [`docs/`](docs/) — the documentation site source (built with [zensical](https://github.com/zensical/zensical)).

Common tasks are wrapped in a [`Makefile`](Makefile) (run `make` or `make help` to list them):

```bash
make install      # npm install
make validate     # validate the example schemas against the meta-schema
make docs         # build + serve the documentation with live reload
make docs-build   # build the site into ./site
make check        # validate schemas + strict docs build
```

The docs are built with [zensical](https://github.com/zensical/zensical) (a Python tool) run via [uv](https://docs.astral.sh/uv/) — no local Python setup required. The site is deployed to GitHub Pages automatically on every push to `main`, but only after schema validation succeeds (see [`.github/workflows/main.yml`](.github/workflows/main.yml)).

## License

Released under [CC0 1.0 Universal](LICENSE).
