# Introduction

OO-LD Schema aims to connect the structural modelling of objects and subobjects with the modelling of the semantic relations without reinventing the wheel. It therefore combines existing standards, primarily [JSON Schema](https://json-schema.org/) and a [JSON-LD](https://json-ld.org/) context in the same document.

*Why OO-LD?*

- OO-LD schema documents are supported by a wide range of existing tools (all JSON Schema and JSON-LD tooling!)
- OO-LD schema documents themselves follow linked data principles to make them retrievable over the web to allow flexible schema compositions
- OO-LD schemas allow generic ex- and import of RDF
- OO-LD schemas are compatible with LLM APIs
- OO-LD schemas can be used as function (dataclasses) and API signatures (OpenAPI)
- OO-LD schemas can be used to define graphical user interfaces, in particular forms

![OSL Technologie Stack](https://opensemantic.world/wiki/Special:Redirect/file/OSW95a74be1e22d4b6e9e4f836127d5915a.drawio.svg)

> JSON, JSON Schema and JSON-LD technology stack with [OpenSemanticLab](https://github.com/OpenSemanticLab) as example document store / platform

New to OO-LD? Head to [Get Started](get-started.md) for a first hands-on example, then work through the [Guide](guide/index.md).

## Fundamentals

### Conventions and Terminology

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119).

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

A detailed comparison with related schema languages and data models (OWL, SHACL, Asset Administration Shell, SAMM, LinkML, dlite, NOMAD, and more) is collected in the [Reference » Related Work](reference.md#related-work) table.
