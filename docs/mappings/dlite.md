# Dlite

## Dlite Schema

[Dlite](https://github.com/SINTEF/dlite) already uses JSON Schema keywords like `properties`, `type` and `description`. Similar to NOMAD, annotations `unit` declare the unit of measure of quantity values and `shape` is used to describe array dimensions. However, different from NOMAD, `shape` refers to parameters declared under `dimensions`.

### Person.dlite.yml

```yaml
uri: http://onto-ns.com/meta/0.1/Person # identifier of the schema document
meta: http://onto-ns.com/meta/0.3/EntitySchema # links to a meta schema as type
description: A person.
dimensions:
  nskills: Number of skills.
properties:
  general:
    type: $ref
    $ref: http://onto-ns.com/meta/0.1/Thing # reference to a another schema document
  name:
    type: string
    description: Full name.
  age:
    type: float32
    unit: year
    description: Age of person.
  skills:
    type: string
    shape: [nskills]
    description: List of skills.
```

To overcome the missing expressiveness in JSON Schema alone, specific JSON-LD `@type` annotations can be used (here `xsd:float`). `dimension`, `unit`, and `shape` can be expressed with custom keywords, prefixed by `x-dlite-`.

### Person.oold.yml

```yaml
"@context":
  xsd: http://www.w3.org/2001/XMLSchema
  age:
    "@type": xsd:float # see: https://www.w3.org/TR/xmlschema11-2/#float
$id: http://onto-ns.com/meta/0.1/Person
description: A person.
x-dlite-dimensions:
  nskills: Number of skills.
properties:
  general:
    type: string
    format: uri
    x-oold-range: http://onto-ns.com/meta/0.1/Thing # reference to a another schema document
  name:
    type: string
    description: Full name.
  age:
    type: number
    x-dlite-unit: year
    description: Age of person.
  skills:
    type: array
    x-dlite-shape: [nskills]
    description: List of skills.
    #minItems: ? # can be set if nskills is known
    #maxItems: ? # can be set if nskills is known
    items:
      type: string
```

## Instance

On the instance level the main difference is the nesting of properties within a `properties` subobject. This can be interpreted as JSON-LD [nested-properties](https://www.w3.org/TR/json-ld/#nested-properties). Links to other instance documents are UUIDs which should be interpreted as `urn:uuid`.

### SherlockHolmes.dlite.yml

```yaml
"@context":
  - /remote/context/of/Person
  - properties: "@nest" # skip this level

uuid: 8cbd4c09-734d-4532-b35a-1e0dd5c3e8b5
meta: http://onto-ns.com/meta/0.1/Person # like type
properties:
  general: <UUID of a Thing instance document>
  name: Sherlock Holmes
  age: 34.0
  skills:
    - observing
    - chemistry
    - violin
    - boxind
```

### SherlockHolmes.oold.yml

```yaml
"@context": http://onto-ns.com/meta/0.1/Person
$schema: http://onto-ns.com/meta/0.1/Person
uuid: 8cbd4c09-734d-4532-b35a-1e0dd5c3e8b5
general: urn:uuid:<UUID of a Thing instance document>
name: Sherlock Holmes
age: 34.0
skills:
  - observing
  - chemistry
  - violin
  - boxind
```
