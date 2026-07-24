# Introduction

OO-LD Schema aims to connect the structural modelling of objects and subobjects with the modelling of the semantic relations without reinventing the wheel. It therefore combines existing standards, primarily [JSON Schema](https://json-schema.org/) and a [JSON-LD](https://json-ld.org/) context in the same document.

What makes OO-LD different from other approaches that unify structure and semantics is that the artefact *is* the source: one document is at the same time a valid JSON Schema and a referenceable JSON-LD remote context, so there is no separate modelling language and no build step generating a schema and a context that then have to be kept in sync. The same holds at the instance level - an OO-LD instance is a valid JSON-LD document, and OO-LD-aware tooling resolves the IRIs it references into linked objects, so a stored graph can be navigated as objects.

*Why OO-LD?*

- OO-LD schema documents are supported by a wide range of existing tools (all JSON Schema and JSON-LD tooling!)
- OO-LD schema documents themselves follow linked data principles to make them retrievable over the web to allow flexible schema compositions
- OO-LD schemas allow generic ex- and import of RDF
- OO-LD schemas are compatible with LLM APIs
- OO-LD schemas can be used as function (dataclasses) and API signatures (OpenAPI)
- OO-LD schemas can be used to define graphical user interfaces, in particular forms
- OO-LD schemas turn a wiki or document store into a compounding, SPARQL-queryable knowledge base - the ["LLM Wiki" pattern](use-cases.md#structured-knowledge-bases-the-llm-wiki-pattern)

![OSL Technologie Stack](https://opensemantic.world/wiki/Special:Redirect/file/OSW95a74be1e22d4b6e9e4f836127d5915a.drawio.svg)

> JSON, JSON Schema and JSON-LD technology stack with [OpenSemanticLab](https://github.com/OpenSemanticLab) as example document store / platform

New to OO-LD? Head to [Get Started](get-started.md) for a first hands-on example, then work through the [Guide](guide/index.md).

!!! note "Guide vs. Specification"
    This site is the didactic, example-driven **guide (primer)**. The normative, W3C-style **[Specification](spec/index.html)** defines the conformance requirements (`MUST`/`SHOULD`) with defined terms and references. The two are cross-linked: use the guide to learn, the specification to cite.

## Fundamentals

### Design Goals and Rationale

#### Compatibility

An OO-LD document is always a valid JSON document. This ensures that all the standard JSON libraries work seamlessly with OO-LD documents.

An OO-LD instance document is always a valid JSON-LD document. This ensures that all the standard JSON-LD libraries work seamlessly with OO-LD instance documents.

An OO-LD schema document is always both a valid JSON Schema document and JSON-LD remote context. This ensures that all the standard JSON Schema and JSON-LD libraries work seamlessly with OO-LD schema documents.

#### Expressiveness

An OO-LD schema document allows the developer to express the syntax of a JSON instance document side by side with its semantics in a single source.

In addition, syntactical and semantic definitions can also be applied to external JSON instance documents that reference OO-LD schema documents.

This allows to specify well-defined patterns in a directed graph and enables tools relying on a hierarchical object structure to produce data for and consume data from such a graph.

#### Interoperability

OO-LD schema documents allow to specify all information that is needed to automatically transform data between semantically equivalent but syntactically different notations.

## Related Work

![OO-LD Bridge General Software](https://opensemantic.world/wiki/Special:Redirect/file/OSW01a9133879e94df19a8e617d91d28f39.drawio.svg)
> OO-LD as bridge between linked data and the general software domain

Data modelling is often described in three layers: conceptual (RDFS, OWL), logical (SHACL, ShEx) and physical (JSON Schema, XML Schema). OO-LD is a physical-layer artefact that carries enough conceptual annotation to generate the logical and conceptual layers from the same source. Rather than replacing frameworks like LinkML, SPDX or TreeLDR - which compile a bespoke source into a separate schema and context - OO-LD annotates JSON Schema in place and offers generated bridges (for example `x-jsonld-*` for OpenAPI and MCP delivery) to the forms other ecosystems expect. It therefore acts as an interlingua rather than yet another isolated syntax.

A detailed comparison with related schema languages and data models (OWL, SHACL, Asset Administration Shell, SAMM, LinkML, SPDX, Croissant, dlite, NOMAD, and more) is collected in the [Reference » Related Work](reference.md#related-work) table.

## Getting involved

Questions, ideas and design discussion are welcome - for now all in the issue tracker (one searchable place while the community is small):

- **Question** (usage, tooling, spec interpretation) - open an issue with the [`question`](https://github.com/OO-LD/oold-schema/labels/question) label.
- **Open-ended discussion / proposal** - open an issue with the [`discussion`](https://github.com/OO-LD/oold-schema/labels/discussion) label.
- **Bug or feature** - open a regular [issue](https://github.com/OO-LD/oold-schema/issues).
- **Contributions** - pull requests are welcome; for larger changes, open a `discussion` issue first.

JSON Schema and JSON-LD take the same approach on their spec repos, keeping questions and proposals as labelled issues. We'll consider GitHub Discussions or a chat once demand grows.
