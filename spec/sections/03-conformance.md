## Conformance {#conformance}

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in [[!RFC2119]].

### Notation {#notation}

The normative data model of OO-LD is the JSON data model shared by [[JSONSCHEMA]] and [[JSON-LD11]]. :rule[OOLD-CNF-1120]{applies=document machine_checkable=no level=MUST summary="A conforming schema or instance must be interchangeable as JSON, canonicalized per RFC 8785."}JSON ([[RFC8259]]) is the canonical serialization: a conforming OO-LD schema or instance MUST be interchangeable as JSON, and the canonical form used for identity and integrity (for example content-hashing a versioned schema) is its JSON Canonicalization Scheme ([[RFC8785]]) serialization.

A document MAY additionally be authored or served as YAML, provided it stays within the JSON-compatible subset of [YAML 1.2](https://yaml.org/spec/1.2.2/): no tags, anchors, aliases, or merge keys; a single document; and no implicit typing beyond what JSON expresses. Within this subset - which coincides with the Basic profile of [YAML-LD](https://github.com/w3c/yaml-ld) - a YAML document maps one-to-one onto the JSON data model and converts to the canonical JSON without loss. :rule[OOLD-CNF-22d3]{applies=document level="MUST NOT" summary="A YAML serialization outside the JSON-compatible subset is not a conforming OO-LD serialization."}A YAML document outside this subset, including one relying on the features YAML-LD admits only in its Extended profile, MUST NOT be treated as a conforming OO-LD serialization.

Authors using YAML should be aware that YAML comments and implicit type coercions (for example the strings `NO` or `1.10` read as a boolean or a truncated number by some parsers) do not survive conversion to the canonical JSON. :rule[OOLD-CNF-d71d]{applies=document machine_checkable=no level=MUST summary="Where a YAML form and its canonical JSON disagree, the JSON form is authoritative."}Where the two forms disagree, the JSON form MUST be treated as authoritative. Examples in this specification are shown as JSON, with an equivalent YAML rendering available under "View as YAML".
