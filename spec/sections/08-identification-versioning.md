## Identification and Versioning {#identification-versioning}

### Identification {#identification}

OO-LD schemas MUST have a `$id` ([[JSONSCHEMA]] §8.2.1) which works as a global and unique identifier of the schema. The value of `$id` MAY be an absolute URI. The schema SHOULD be resolvable via this URI. The schema SHOULD have an annotation `x-oold-uuid` with a UUID value, and it is recommended to use the UUID also in the `$id`.

### Ontology class IRI (`x-oold-iri`) {#ontology-class-iri}

`x-oold-iri` declares the IRI of the ontology class that this schema realizes - the RDF/OWL class from an external vocabulary that gives the schema its semantic grounding. It is distinct from `$id` (the URL of the schema document) and from `x-oold-instance-rdf-type` (the `rdf:type`s that instances carry on export). OO-LD-aware tooling uses `x-oold-iri` to anchor the schema in an ontology graph, independently of where the schema document is hosted.

### Versioning {#versioning}

The schema version SHOULD be indicated by `x-oold-version`; a prior version MAY be indicated with `x-oold-prior-version`. For single-schema versioning, the version SHOULD be part of the `$id`. For schema-package versioning (recommended), the version of the package SHOULD be prepended before the schema's ID. Schemas MAY indicate explicit backward-compatibility with `x-oold-backward-compatible-with` and `x-oold-incompatible-with`. Instance documents SHOULD always use a versioned schema URL.
