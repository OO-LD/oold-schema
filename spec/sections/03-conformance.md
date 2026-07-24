## Conformance {#conformance}

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in [[!RFC2119]].

### Notation {#notation}

The normative data model of OO-LD is the JSON data model shared by [[JSONSCHEMA]] and [[JSON-LD11]]. JSON ([[RFC8259]]) is the canonical serialization: a conforming OO-LD schema or instance MUST be interchangeable as JSON, and the canonical form used for identity and integrity (for example content-hashing a versioned schema) is its JSON Canonicalization Scheme ([[RFC8785]]) serialization.

A document MAY additionally be authored or served as YAML, provided it stays within the JSON-compatible subset of [YAML 1.2](https://yaml.org/spec/1.2.2/): no tags, anchors, aliases, or merge keys; a single document; and no implicit typing beyond what JSON expresses. Within this subset - the same profile adopted by [YAML-LD](https://github.com/w3c/yaml-ld) - a YAML document maps one-to-one onto the JSON data model and converts to the canonical JSON without loss. YAML outside this subset is NOT a conforming OO-LD serialization.

Authors using YAML should be aware that YAML comments and implicit type coercions (for example the strings `NO` or `1.10` read as a boolean or a truncated number by some parsers) do not survive conversion to the canonical JSON; the JSON form is authoritative. Examples in this specification are shown as JSON, with an equivalent YAML rendering available under "View as YAML".
