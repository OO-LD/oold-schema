# OO-LD Schema

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.11401726.svg)](https://doi.org/10.5281/zenodo.11401726)

**The Object-Oriented Linked Data Schema, based on [JSON-LD](https://json-ld.org/) and [JSON Schema](https://json-schema.org/) - work in progress.**

OO-LD connects the structural modelling of objects and subobjects with the modelling of their semantic relations, without reinventing the wheel: a single OO-LD document is at once a valid **JSON Schema** and a reference-able **JSON-LD context**. You define the structure of your data and its meaning in one source, then reuse that schema for validation, RDF generation, code generation, user interfaces, and API definitions - using the JSON Schema and JSON-LD tooling you already have.

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

- [Introduction](https://oo-ld.github.io/oold-schema/latest/introduction/) - what OO-LD is and why.
- [Get Started](https://oo-ld.github.io/oold-schema/latest/get-started/) - a first hands-on example.
- [Guide](https://oo-ld.github.io/oold-schema/latest/guide/) - basic concepts, composition, schema instances, identification & versioning, extensions, and the meta-schema.
- [Use Cases](https://oo-ld.github.io/oold-schema/latest/use-cases/), [Mappings](https://oo-ld.github.io/oold-schema/latest/mappings/), [Tooling](https://oo-ld.github.io/oold-schema/latest/tooling/), and [Reference](https://oo-ld.github.io/oold-schema/latest/reference/).

The normative, W3C-style **[Specification](https://oo-ld.github.io/oold-schema/latest/spec/)** (rendered with [ReSpec](https://respec.org/)) accompanies the guide: the guide is for learning, the specification is for conformance and citation.

## Repository contents

- [`examples/`](examples/) - example OO-LD schemas (`Person`, `Organization`, `Address`, `Researcher`, `Thing`).
- [`meta/oold-meta-schema.json`](meta/oold-meta-schema.json) - the OO-LD dialect meta-schema, defining the `x-oold-*` keywords.
- [`docs/`](docs/) - the documentation site source (built with [zensical](https://github.com/zensical/zensical)).
- [`spec/`](spec/) - the specification source, written in plain Markdown.
- [`macros.py`](macros.py) - shared macros that pull reused content (examples, the keyword table) into both the guide and the spec.
- [`scripts/`](scripts/) - the schema validator and the spec renderer.

### How the docs and spec are published

Everything is written once and reused. The guide pages and the specification pull their example schemas from [`examples/`](examples/) and the keyword vocabulary from [`meta/`](meta/) via small macros, so those never drift apart. The specification itself is plain Markdown in [`spec/sections/`](spec/sections/); `make spec` renders it into a W3C-style page ([ReSpec](https://respec.org/)) at [`docs/spec/index.html`](docs/spec/index.html), which is committed and served as part of the site. On every push, CI validates the example schemas, re-renders the spec, and fails if the committed copy is stale; on `main` the site is then deployed to GitHub Pages (see [`.github/workflows/main.yml`](.github/workflows/main.yml)).

Common tasks are wrapped in a [`Makefile`](Makefile) (run `make` or `make help` to list them):

```bash
make validate   # validate the example schemas against the meta-schema
make spec       # re-render the specification from spec/ and meta/
make docs       # serve the documentation site locally with live reload
make preview    # re-render the spec, then serve the site
make check      # validate + spec lint + site build (what CI runs)
```

The docs and the spec renderer run on Python via [uv](https://docs.astral.sh/uv/) - no local Python setup required; the schema validator runs on Node (`make install` once).

## Getting involved

Questions, ideas and design discussion are welcome - for now all in the issue tracker (one searchable place while the community is small):

- **Question** (usage, tooling, spec interpretation) - open an issue with the [`question`](https://github.com/OO-LD/oold-schema/labels/question) label.
- **Open-ended discussion / proposal** - open an issue with the [`discussion`](https://github.com/OO-LD/oold-schema/labels/discussion) label.
- **Bug or feature** - open a regular [issue](https://github.com/OO-LD/oold-schema/issues).
- **Contributions** - pull requests are welcome; for larger changes, open a `discussion` issue first.

We'll consider GitHub Discussions or a chat once demand grows.

## License

Released under [CC0 1.0 Universal](LICENSE).
