# From OWL or SHACL

Coming from an ontology (OWL) or shape constraints (SHACL), OO-LD is not a replacement - it is the object-shaped, JSON-native layer that *points at* your ontology and carries just enough constraint for validation and UI or code generation:

- `x-oold-iri` names the OWL/RDFS class the schema realizes.
- `@context` maps each property to its predicate IRI (and marks references with `"@type": "@id"`).
- `x-oold-range` constrains the target class of a relation (the SHACL `sh:class` / object-property range case) - an IRI, a list of IRIs, or an inline subschema.

## Small example

An OWL class with a SHACL shape constraining a relation:

```turtle
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix schema: <http://schema.org/> .

schema:Organization a owl:Class .

[] a sh:NodeShape ;
   sh:targetClass schema:Organization ;
   sh:property [ sh:path schema:employee ; sh:class schema:Person ] .
```

The same as an OO-LD schema - `x-oold-iri` is the class, the `@context` maps the relation to its predicate and marks it a reference, and `x-oold-range` carries the `sh:class` target:

{{ inline_file('examples/OwlOrganization.schema.json') }}

The `employee` value is a plain string; `"@type": "@id"` in the context makes it an IRI reference and `x-oold-range` restricts its class - no string `format` is needed (see [the reference form of a range](../spec/#range-reference-form) in the specification for why `format: "iri"` is a poor fit for IRI-valued properties). This schema and an instance are committed example files (`examples/OwlOrganization.schema.json`, `examples/OwlOrganization.instance.json`), covered by `make validate`.

That covers the common object-modelling subset; OO-LD does not aim to express the full OWL axiom set or every SHACL constraint. For how OO-LD relates to these and other schema languages, and for worked mappings, see:

- [Reference](../reference.md) - comparison with related work.
- [Mappings](../mappings.md) - worked interoperability mappings.

## Next steps

- [Extensions](../guide/extensions.md) - `x-oold-iri`, `x-oold-range`, and reverse properties.
- [From RDF, in particular JSON-LD](from-rdf.md) - the RDF and JSON-LD data chain.
