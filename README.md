[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.11401726.svg)](https://doi.org/10.5281/zenodo.11401726)

# OO-LD Schema

The Object-Oriented Linked Data Schema based on [JSON-LD](https://json-ld.org/) and [JSON Schema](https://json-schema.org/) - work in progress.

A single OO-LD document is at once a valid JSON Schema and a reference-able JSON-LD context: you define the structure of your data and its meaning in one source, then reuse that schema for validation, RDF generation, code generation, user interfaces, and API definitions.

## Documentation

- Specification (normative): [`spec/sections/`](spec/sections/) - the W3C-style spec source.
- Guide (overview): [`docs/`](docs/) - a short walk-through that cross-references the spec.

## Repository contents

- [`examples/`](examples/) - example OO-LD schemas.
- [`meta/oold-meta-schema.json`](meta/oold-meta-schema.json) - the OO-LD dialect meta-schema.
- [`scripts/validate.mjs`](scripts/validate.mjs) - validates the example schemas against the meta-schema.

## License

Released under [CC0 1.0 Universal](LICENSE).
