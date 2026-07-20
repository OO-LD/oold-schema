# Tooling

Because OO-LD documents are ordinary JSON Schema and JSON-LD, the full ecosystem of both standards applies. The lists below collect generic tooling, OO-LD-specific implementations, and interactive playgrounds.

## General

- [JSON-LD Tooling](https://json-ld.org/#developers)
- [JSON Schema Tooling](https://json-schema.org/implementations)
- [Code Analysis](https://github.com/OO-LD/awl-schema)
- [LLM Structured Output and Toolcalling](https://python.langchain.com/docs/how_to/structured_output/)

## OO-LD Specific

- Python: [oold-python](https://github.com/OpenSemanticWorld/oold-python)
- Javascript Framework for graph visualization and editing: [interactive-semantic-graph](https://github.com/OpenSemanticLab/interactive-semantic-graph)
- Fully integrated platform (currently) based on Semantic Mediawiki: [docker-compose](https://github.com/OpenSemanticLab/osl-mw-docker-compose), [Demo](https://demo.open-semantic-lab.org/wiki/Main_Page)
- [LLM Integration](https://github.com/opensemanticworld/osw-chatbot/)

## Playgrounds

- [UI & RDF Generation](https://oo-ld.github.io/playground-yaml/)
- [Python Code Generation](https://oo-ld.github.io/playground-python-yaml/)
- [Python Class Annotation & UI Generation](https://repolab.github.io/jupyterlite-playground/lab/index.html?fromURL=https://raw.githubusercontent.com/OO-LD/oold-python/refs/heads/main/examples/linked_data_editor.ipynb)
- [Semantic Workflow Description](https://oo-ld.github.io/playground-awl/)
- [Human-in-the-Loop UI Workflow](https://repolab.github.io/jupyterlite-playground/lab/index.html?fromURL=https://raw.githubusercontent.com/OO-LD/awl-python/refs/heads/main/examples/human_in_the_loop_async.ipynb)

## Validation and test suites

The [`oold-schema`](https://github.com/OO-LD/oold-schema) repository ships a validation harness ([`scripts/validate.mjs`](https://github.com/OO-LD/oold-schema/blob/main/scripts/validate.mjs)) with two tiers. Run both with `make validate`, or `make check` (which also re-renders the spec and builds the site); CI runs `make check` on every push.

### General workflow (any schema, no fixtures)

These run on every schema and instance in [`examples/`](https://github.com/OO-LD/oold-schema/tree/main/examples) with no per-schema test data, so they apply to any OO-LD schema you write:

- **Well-formedness** - the schema validates against the OO-LD meta-schema and its `$ref` composition resolves.
- **Auto-generated instance** - an instance is generated (via [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker), all properties, declared `format`s respected) and must validate against the schema; this catches unsatisfiable schemas.
- **Branch iteration** - each `oneOf` / `anyOf` branch is pinned in turn and an instance generated for it, exercising every variant deterministically.
- **RDF roundtrip** - each instance is converted instance -> RDF -> instance. It fails if a property is lost (the `@context` does not map it) or if the reconstruction no longer validates against its schema (the `@context` did not preserve a property's shape - for example a strict `type: array` property whose single-element array came back as a scalar).
- **Pattern lint** - each schema's `@context` is checked for round-trip-safe patterns. Errors (MUST): a term must not coerce a literal with `"@type": "xsd:string"` (it never round-trips, since `xsd:string` is elided from plain literals), and a strictly `type: array` property must declare `"@container": "@set"` (or `"@list"`), or a single-element array returns as a scalar and fails re-validation. A cardinality-flexible property (a `oneOf`/`anyOf` of a literal and an array) MAY declare it but need not. Warning (SHOULD): a bare-IRI-string reference that lacks an `iri-reference` (or stricter `uri*`) `format` - the reference still round-trips, so a lexical format is only recommended.

Note on IRI formats: `iri` and `iri-reference` are provided by the [`ajv-formats-draft2019`](https://github.com/luzlab/ajv-formats-draft2019) plugin, whose regexes are currently buggy - they reject valid compact IRIs such as `ex:alice` and are even mutually inconsistent (`iri` accepts `urn:uuid:...`, `iri-reference` does not). Because a compact IRI is a valid IRI ([RFC 3987](https://www.rfc-editor.org/rfc/rfc3987) - an IRI is a superset of a URI), the harness overrides these two `format` checks with conformant implementations. If you validate OO-LD schemas with your own ajv setup, apply the same override until the plugin is fixed ([upstream bug](https://github.com/luzlab/ajv-formats-draft2019/issues/31)).

### Deterministic per-feature suites

Precise fixtures with exact expected outcomes live in [`examples/compliance/`](../examples/compliance/):

- **Vocabulary well-formedness** (`oold-vocab.json`) - candidate schemas checked against the meta-schema, asserting each `x-oold-*` / `x-oold-ui-*` keyword is accepted when well-formed and rejected when malformed. A coverage cross-check reads the keyword list from the meta-schemas and fails if any keyword is untested, keeping the suite in sync with them.
- **OO-LD JSON-LD constructs** (`jsonld-features.json`) - only the constructs OO-LD adds on top of plain JSON-LD (base-class `@context` inheritance, property-`$ref` scoped contexts), not vanilla JSON-LD. Each case merges the [JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) shape (`valid`) with the [JSON-LD Test Suite](https://w3c.github.io/json-ld-api/tests/) shape (`expectRdf`, compared by RDF dataset isomorphism; `expectErrorCode` for negatives).

To extend it: add a case to `oold-vocab.json` whenever you add a meta-schema keyword (the coverage check will otherwise fail), or add an `examples/compliance/<feature>.json` group that names an example schema via `schemaRef` and asserts `valid` / `expectRdf` per instance.

OO-LD *semantic* behaviour that a validator and a JSON-LD processor cannot check on their own - `x-oold-range` enforcement, composition merge and most-derived-wins override, `x-oold-ref` resolution - is a conformance target for the [`oold`](https://github.com/OO-LD/oold-python) library and reuses the same fixture format.
