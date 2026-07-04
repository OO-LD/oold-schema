| Keyword | Description |
| --- | --- |
| `x-oold-uuid` | Stable UUID identifying this schema across versions and locations. |
| `x-oold-version` | Semantic version of this schema. |
| `x-oold-prior-version` | Identifier or version of the immediately preceding schema version. |
| `x-oold-backward-compatible-with` | URI of a prior schema version this schema is backward-compatible with. |
| `x-oold-incompatible-with` | URI of a prior schema version this schema is NOT compatible with. |
| `x-oold-iri` | Ontology IRI (or compact IRI) denoting the class described by this schema. |
| `x-oold-instance-rdf-type` | The rdf&#58;type(s) carried by instances of this schema, as a list of IRIs (e.g. ["schema&#58;Person"]). OO-LD tooling materializes these as @type when exporting an instance to JSON-LD / RDF. |
| `x-oold-ref` | Reference to another OO-LD schema. Use x-oold-ref (not the standard $ref) for references that appear inside OO-LD custom keywords such as x-oold-range: there a plain $ref would be eagerly - and, for cyclic schema graphs, dangerously - dereferenced by generic JSON-Schema bundlers (the behaviour is undefined per Core section 9.4.2). Keep using the standard $ref for ordinary schema composition (allOf, properties, $defs), which bundlers are expected to resolve. x-oold-ref is resolved only by OO-LD-aware tools, lazily and with cycle handling. |
| `x-oold-range` | Type constraint on the target of an IRI-valued property: an IRI string, an array of IRIs, or an OO-LD subschema (using x-oold-ref for references). See the 'Range of properties' section. |
| `x-oold-multilang-title` | Language map of translated `title` values keyed by BCP-47 language code. |
| `x-oold-multilang-description` | Language map of translated `description` values keyed by BCP-47 language code. |
| `x-oold-reverse-properties` | Properties stored on the related object but editable from this side, mapped via JSON-LD @reverse. |
| `x-oold-reverse-required` | Names of reverse properties that are required. |
| `x-oold-reverse-defaultProperties` | Names of reverse properties shown by default in generated user interfaces. |
