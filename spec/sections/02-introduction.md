## Introduction {#introduction .informative}

OO-LD Schema aims to connect the structural modelling of objects and subobjects with the modelling of the semantic relations without reinventing the wheel. It therefore combines existing standards, primarily [JSON Schema](https://json-schema.org/) and a [JSON-LD](https://json-ld.org/) context in the same document.

- OO-LD schema documents are supported by a wide range of existing tools (all JSON Schema and JSON-LD tooling).
- OO-LD schema documents themselves follow linked data principles to make them retrievable over the web, allowing flexible schema compositions.
- OO-LD schemas allow generic ex- and import of RDF.
- OO-LD schemas are compatible with LLM APIs.
- OO-LD schemas can be used as function (dataclass) and API signatures (OpenAPI).
- OO-LD schemas can be used to define graphical user interfaces, in particular forms.

### Design Goals and Rationale {#design-goals}

#### Compatibility {#compatibility}

An OO-LD document is always a valid JSON document. This ensures that all the standard JSON libraries work seamlessly with OO-LD documents.

An OO-LD instance document is always a valid JSON-LD document. This ensures that all the standard JSON-LD libraries work seamlessly with OO-LD instance documents.

An OO-LD schema document is always both a valid JSON Schema document and JSON-LD remote context. This ensures that all the standard JSON Schema and JSON-LD libraries work seamlessly with OO-LD schema documents.

#### Expressiveness {#expressiveness}

An OO-LD schema document allows the developer to express the syntax of a JSON instance document side by side with its semantics in a single source.

In addition, syntactical and semantic definitions can also be applied to external JSON instance documents that reference OO-LD schema documents.

This allows to specify well-defined patterns in a directed graph and enables tools relying on a hierarchical object structure to produce data for and consume data from such a graph.

#### Interoperability {#interoperability}

OO-LD schema documents allow to specify all information that is needed to automatically transform data between semantically equivalent but syntactically different notations.
