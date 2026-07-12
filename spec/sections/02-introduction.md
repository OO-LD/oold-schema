## Introduction {#introduction .informative}

OO-LD Schema aims to connect the structural modelling of objects and subobjects with the modelling of the semantic relations without reinventing the wheel. It therefore combines existing standards, primarily [JSON Schema](https://json-schema.org/) and a [JSON-LD](https://json-ld.org/) context in the same document.

What distinguishes OO-LD from other approaches that unify structure and semantics is that the artefact *is* the source. A single OO-LD document is at the same time a valid JSON Schema and a referenceable JSON-LD remote context, so there is no separate modelling language to learn and no build step that generates - and then has to keep in sync - a separate schema and a separate context. The same property extends to the instance level: an OO-LD instance is a valid JSON-LD document, and OO-LD-aware tooling (for example the `oold` library) resolves the IRIs it references into linked objects, so a stored graph can be navigated as objects rather than as loose identifiers.

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

### Positioning {#positioning .informative}

Data modelling is commonly described in three layers: a conceptual layer (RDFS, OWL), a logical layer (SHACL, ShEx) and a physical layer (JSON Schema, XML Schema). Keeping these layers consistent when they are authored separately is a recurring problem. OO-LD is a physical-layer artefact that carries enough conceptual annotation - its JSON-LD `@context` together with keywords such as `x-oold-range` (see [](#extensions)) - to generate the logical layer (SHACL shapes) and the conceptual layer (OWL) from the same source, so the layers cannot drift apart.

OO-LD does not aim to replace established modelling frameworks. Frameworks such as [LinkML](https://linkml.io/), [SPDX 3.0](https://spdx.github.io/spdx-spec/), [jargon.sh](https://jargon.sh/) and [TreeLDR](https://www.spruceid.dev/treeldr/treeldr-overview) compile a bespoke source into JSON Schema and a separate JSON-LD context; OO-LD instead annotates JSON Schema in place and offers generated bridges to the forms other ecosystems expect. A consumer that cannot accept a top-level `@context` - OpenAPI 3.0, or a strict LLM structured-output subset - is served a generated form (`x-jsonld-context` / `x-jsonld-type`, or annotations folded into `title` / `description`; see [](#extensions)) rather than a hand-maintained parallel document, so the single OO-LD source stays authoritative. This positions OO-LD as an interlingua in the physical layer, not as another isolated syntax.

### Structure first, semantics deferred {#structure-first .informative}

A JSON Schema keyword names a property with a local string; an RDF predicate is a global IRI. RDF-based schema languages such as SHACL therefore require every participating term to be a committed, globally named IRI before data can be expressed or validated as a graph: RDF has no notion of a field whose meaning is not yet decided. This is not a question of how many vocabularies are involved - SHACL validates across many vocabularies at once - but of *when* the commitment must be made. In domains where a shared vocabulary is missing, contested, or still emerging, that eager, per-term commitment is a barrier to starting.

OO-LD inverts the order. Because it is JSON Schema first, a term exists as a plain structural property with no semantics attached; an author MAY leave it unmapped, map it to a single IRI, or map it to several concurrent IRIs (see [](#multi-mapping) and [](#synonyms)). Any data can be serialized as JSON and therefore described by a schema, so the structural model - validation, forms, code generation, transport - is always available, and semantics can be added later, incrementally, one term at a time. The floor on this deferral is identity, not zero: graph-shaped data still needs identifiers for its links (carried by IRI-valued properties and [](#range-of-properties)), but the vocabulary and meaning of each field can be deferred without blocking any of the structural uses. This is the boundary to RDF/SHACL: they cannot withhold semantic commitment, OO-LD can.
