# Mappings

OO-LD can act as a bridge between several existing schema languages and data models. This page shows how selected formats map to OO-LD schemas and instances.

## Asset Administration Shell

Asset Administration Shell combines schema and data in a single documents. Semantics are introduced by annotations keywords.

### AAS

```yml
- assetInformation:
    assetKind: Instance
    globalAssetId: test
  id: https://example.org/Simple_AAS
  modelType: AssetAdministrationShell
  submodels:
  - keys:
    - type: Submodel
      value: https://example.org/Simple_Submodel
    type: ModelReference

- id: https://example.org/Simple_Submodel
  modelType: Submodel
  submodelElements:
  - idShort: ExampleProperty
    modelType: Property
    semanticId:
      keys:
      - type: GlobalReference
        value: http://example.org/Properties/SimpleProperty
      type: ExternalReference
    value: exampleValue
    valueType: xs:string
```

### OO-LD Schemas

```yml
- id: https://example.org/Simple_AAS
  x-aas-modelType: AssetAdministrationShell

- id: https://example.org/Simple_Submodel
  "@context":
    ExampleProperty: http://example.org/Properties/SimpleProperty
  x-aas-modelType: Submodel
  allOf: 
    $ref: https://example.org/Simple_AAS
  properties:
    ExampleProperty:
      type: string
      default: exampleValue # works like a template
```

### OO-LD Data

```yml
"@context": https://example.org/Simple_Submodel
$schema: https://example.org/Simple_Submodel
ExampleProperty: exampleValue
```

## Semantic Aspect Meta Model

[Semantic Aspect Meta Model (SAMM)](https://docs.bosch-semantic-stack.com/oss/samm-specification.html) is a lightweight language to model (partial) objects (aspects) and their properties. While building on RDF and using turtle as serialization SAMM forms tree like structures like JSON Schema. Instead of IRIs, Ressources are identified with URNs which are not meant to be resolveable in the sense of linked data / semantic web.

Example (see [AddressAspect.ttl](https://github.com/eclipse-tractusx/sldt-semantic-models/blob/main/io.catenax.shared.address_characteristic/4.0.0/AddressAspect.ttl) for an address, stripping everything but the post code attribute):

### SAMM

```turtle

@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.1.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.1.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.1.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.1.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:io.catenax.shared.address_characteristic:4.0.0#> .

:AddressAspect a samm:Aspect ;
   samm:preferredName "Address Aspect"@en ;
   samm:description "Aspect used for the Characteristic :PostalAddress to reference address data."@en ;
   samm:properties ( :address ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:address a samm:Property ;
   samm:preferredName "Address"@en ;
   samm:description "The address of the data provider."@en ;
   samm:characteristic :PostalAddress .

:PostalAddress a samm:Characteristic ;
   samm:preferredName "PostalAddress"@en ;
   samm:description "A characteristic to express the postal address and which is intended to be referenced by other aspects."@en ;
   samm:dataType :AddressEntity .

:AddressEntity a samm:Entity ;
   samm:preferredName "Address Entity"@en ;
   samm:description "Entity of an address. Model follows specification of BPDM (Business Partner Data Management)."@en ;
   samm:properties ( :thoroughfare :locality [ samm:property :premise; samm:optional true ] [ samm:property :postalDeliveryPoint; samm:optional true ] :country :postCode ) .

:postCode a samm:Property ;
   samm:preferredName "Post Code"@en ;
   samm:description "Postal code of the address."@en ;
   samm:characteristic :PostCodeCharacteristic .

:PostCodeCharacteristic a samm-c:SingleEntity ;
   samm:preferredName "PostCode Characteristic"@en ;
   samm:description "Characteristic for defining a postcode which can consist of a type (e.g. \"REGULAR\" for zip codes) and a value (e.g. \"98765-4321\"). Model follows the specification of BPDM."@en ;
   samm:dataType :PostCodeEntity .

:PostCodeEntity a samm:Entity ;
   samm:preferredName "PostCode Entity"@en ;
   samm:description "Entity for a postcode which consists of a type plus a value."@en ;
   samm:properties ( [ samm:property :postCodeValue; samm:payloadName "value" ] [ samm:property :postCodeTechnicalKey; samm:payloadName "technicalKey" ] ) .

:postCodeValue a samm:Property ;
   samm:preferredName "Post Code Value"@en ;
   samm:description "The value of a post code."@en ;
   samm:characteristic :PostCodeTrait ;
   samm:exampleValue "98765-4321" .

:postCodeTechnicalKey a samm:Property ;
   samm:preferredName "Post Code Technical Key"@en ;
   samm:description "The technical key of a post code."@en ;
   samm:characteristic :PostCodeTechnicalKeyCharacteristic .

:PostCodeTrait a samm-c:Trait ;
   samm-c:baseCharacteristic samm-c:Text ;
   samm-c:constraint :PostCodeConstraint .

:PostCodeTechnicalKeyCharacteristic a samm-c:Enumeration ;
   samm:preferredName "Post Code Technical Key Characteristic"@en ;
   samm:description "Characteristic for the technical key of a post code."@en ;
   samm:dataType xsd:string ;
   samm-c:values ( "CEDEX" "LARGE_MAIL_USER" "OTHER" "POST_BOX" "REGULAR" ) .
```

### OO-LD Schema Example

see also [generated JSON Schema](https://github.com/eclipse-tractusx/sldt-semantic-models/blob/main/io.catenax.shared.address_characteristic/4.0.0/gen/AddressAspect.json)

```json
{
  "@context": {
    "type": "@type",
    "PostalAddress": "urn:samm:io.catenax.shared.address_characteristic:4.0.0#PostalAddress",
    "postCode": "urn:samm:io.catenax.shared.address_characteristic:4.0.0#postCode",
    "PostCodeEntity": "urn:samm:io.catenax.shared.address_characteristic:4.0.0#PostCodeEntity",
    "value": "urn:samm:io.catenax.shared.address_characteristic:4.0.0#postCodeValue",
    "technicalKey": "urn:samm:io.catenax.shared.address_characteristic:4.0.0#postCodeTechnicalKey"
  },
  "description" : "A characteristic to express the postal address and which is intended to be referenced by other aspects.",
  "type" : "object",
  "properties" : {
    "type": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["PostalAddress"]
    },
    "postCode" : {
      "description" : "Postal code of the address. Entity for a postcode which consists of a type plus a value.",
      "type" : "object",
      "properties" : {
        "type": {
          "type": "array",
          "items": { "type": "string" },
          "default": ["PostCodeEntity"]
        },
        "value" : {
          "description" : "The value of a post code.",
          "type" : "string",
          "pattern" : "^[a-z0-9][a-z0-9\\- ]{0,10}$"
        },
        "technicalKey" : {
          "description" : "The technical key of a post code.",
          "type" : "string",
          "enum" : [ "CEDEX", "LARGE_MAIL_USER", "OTHER", "POST_BOX", "REGULAR" ]
        }
      },
      "required" : [ "value", "technicalKey" ]
    },
    "country" : {...}
  },
  "required" : [ "postCode", "..." ]
}
```

### Data instance

```json
{
  "address" : {
    "postCode" : {
      "value" : "98765-4321",
      "technicalKey" : "CEDEX"
    }
  }
}
```

## LinkML

In general LinkML schemas can be exported to JSON Schema and JSON-LD contexts in order to build a OO-LD schema. With <https://github.com/linkml/linkml/pull/2369> lifecycle methods being added to the LinkML jsonschemagen which allow to use annotations to extend the generated schema.

As an example applying <details> <summary>OOLDSchemaGenerator.py</summary>

```python
from pprint import pprint
from linkml.generators.jsonschemagen import JsonSchemaGenerator, JsonSchema
from linkml.generators.jsonldcontextgen import ContextGenerator 
import jsonasobj2
import json
import yaml

class OOLDSchemaGenerator(JsonSchemaGenerator):
        
    def generate_annotations(self, target):
        annotations = jsonasobj2._jsonobj.as_dict(target.source.annotations)
        schema_annotations = {}
        for key in annotations:
            schema_annotations[annotations[key]['tag']] = annotations[key]['value']
        if len(annotations) > 0:
            target.schema_ = {**target.schema_, **schema_annotations}
        return target
        
    def after_generate_class(self, cls, sv):
        self.generate_annotations(cls)
        return cls
        
    def after_generate_class_slot(self, slot, cls, sv):
        self.generate_annotations(slot)
        return slot

    def generate(self):
        _schema = super().generate()
        _context = json.loads(ContextGenerator(self.schema).serialize())
        oold = JsonSchema({"@context": _context["@context"], **_schema})
        return oold

    def serialize(self, **kwargs) -> str:
        return self.generate().to_json(sort_keys=False, indent=self.indent if self.indent > 0 else None)

if __name__ == "__main__":
    print(yaml.dump(json.loads(OOLDSchemaGenerator('Person.min.linkml.yaml', include_null=False).serialize()), sort_keys=False, indent=2))
```

</details>

on an annotated LinkML schema, e.g.

<details> <summary>Person.linkml.yaml</summary>

```yaml
id: https://example.org/Person/
name: Person
prefixes:
      linkml: https://w3id.org/linkml/
      schema: http://schema.org/

imports:
      - linkml:types

classes:
    Organization:
      class_uri: schema:Organization
      attributes:
        name:
          slot_uri: schema:name
          range: string
    Address:
      class_uri: schema:PostalAddress
      attributes:
        street:
          range: string
          slot_uri: schema:street
        city:
          range: string
          slot_uri: schema:city
        postal_code:
          range: string
          slot_uri: schema:postalCode
    Person:
      tree_root: true
      class_uri: schema:Person
      attributes:
        name:
          slot_uri: schema:name
          range: string
          description: the name of a person
          required: true
          annotations:
            - tag: options
              value:
                hidden: false
            - template: "{{first_name}} {{last_name}}"
            - tag: watch
              value: 
                first_name: first_name
                last_name: last_name
                  
        first_name:
          range: string
        last_name:
          range: string
        birth_date:
          slot_uri: schema:birthDate
          range: date
          recommended: true
          annotations: 
            title: Birth date
        address:
          slot_uri: schema:address
          range: Address
        employer:
          name: employer
          range: Organization
          inlined: false
          inlined_as_list: false
```

</details>

produces an OO-LD schema (JSON-LD context + JSON Schema with additional annotation for userinterface generation like, e.g. `options` and `template`)

<details> <summary>Person.oold.yaml</summary>

```yaml
'@context':
  xsd: http://www.w3.org/2001/XMLSchema#
  Person:
    '@id': schema:Person
  linkml: https://w3id.org/linkml/
  schema: http://schema.org/
  '@vocab': https://example.org/Person/
  city:
    '@id': schema:city
  postal_code:
    '@id': schema:postalCode
  street:
    '@id': schema:street
  name:
    '@id': schema:name
  address:
    '@type': '@id'
    '@id': schema:address
  birth_date:
    '@type': xsd:date
    '@id': schema:birthDate
  employer:
    '@type': '@id'
    '@id': employer
  first_name:
    '@id': first_name
  last_name:
    '@id': last_name
  Address:
    '@id': schema:PostalAddress
  Organization:
    '@id': schema:Organization
$schema: https://json-schema.org/draft/2020-12/schema
$id: https://example.org/Person/
metamodel_version: 1.7.0
version: null
title: Person
type: object
additionalProperties: true
$defs:
  Organization:
    type: object
    additionalProperties: false
    description: ''
    properties:
      name:
        type: string
    title: Organization
  Address:
    type: object
    additionalProperties: false
    description: ''
    properties:
      street:
        type: string
      city:
        type: string
      postal_code:
        type: string
    title: Address
  Person:
    type: object
    additionalProperties: false
    description: ''
    properties:
      name:
        type: string
        description: the name of a person
        options:
          hidden: false
        template: '{{first_name}} {{last_name}}'
        watch:
          first_name: first_name
          last_name: last_name
      first_name:
        type: string
      last_name:
        type: string
      birth_date:
        type: string
        format: date
        title: Birth date
      address:
        $ref: '#/$defs/Address'
      employer:
        $ref: '#/$defs/Organization'
    required:
    - name
    title: Person
description: ''
properties:
  name:
    type: string
    description: the name of a person
    options:
      hidden: false
    template: '{{first_name}} {{last_name}}'
    watch:
      first_name: first_name
      last_name: last_name
  first_name:
    type: string
  last_name:
    type: string
  birth_date:
    type: string
    format: date
    title: Birth date
  address:
    $ref: '#/$defs/Address'
  employer:
    $ref: '#/$defs/Organization'
required:
- name
```

</details>

which can be copy-pasted into [OO-LD playground](https://oo-ld.github.io/playground-yaml/?data=N4Ig9gDgLglmB2BnEAuUMDGCA2MBGqIAZglAIYDuApomALZUCsIANOHgFZUZQD62ZAJ5gArlELwwAJzplsrEIgwALKrNSgAAlnhQqAD3FoQ%2BxABNCyqFAgoA9HYpOAdBQDMz6QHM7AJgAM%2FgCMdgAaALIAMgDKKmpkAMQKAApUUrTwGiCaMBYoinGyKKnpCCAAvmy48ADWdPL5VjaI9o5uuZ5SPtV12HYKSqrqjda2DoPxnT4KmgBuYBhkBCPNrQZkdBDYVFN2JRn9bBgwUIJZOXkFQ2Qox6cVbBBgiOTYvFhmVOe5hBNFTy85ABhMCfB6KKBSKhUIxaH75P43F5QmHg%2BAbL7GC6%2FQo3dEMcFkMxmKGIZBY04QTHZH5sbEI3EoIkkmjISogPAwKRQZS8MxkPTnSnU0xmFD8wV0%2BFXeIoTnc5QAEQFX3Zai2YEEaSFgiphGxUsu6uwmu17KIXJevHxmLhlwt6T4NvBAitzqx0tdTox4IAgsTSeS7TjrsVnq9%2FSyyeCAPJdMjwGAALwFcEyHsuiJQca8CeTqbK5XZABJEZZRi0HBwMgBaRG7ElkIhQPzBACcNf8bbsZbYxelTQglbs602212%2BwQhxADHIdFBVDeszSiDThCCzgA7M5%2FApl%2Bk1yh4CJsNg2LAoNtCJPMufddSwJxuOI2MyTmm5MkpJA0rAaKhIREKg%2B0%2BIggxAHM8xTWAymMYVCEfLgeAUN8YPRbAvx%2FbkYH%2FFAiDkRBgJAT4lCkGBoEPEAFAgb8qWw3DQHdUB4IRSEYHgLwKnZC8r3ySDE2gtd2UjQMshY9gkJfEBUI%2FDDaN%2FHDyXw7BCLYEiMDIijYKox55Po8DkWhWEQHE5F2M49k7jOOD71%2BNiOPBAFXneBcxNs1iyIcotzxOXiQBE1lwRvNy9XyRDnxQ4l3wQT89L%2FJSCKI9TNLQwhqLixSsiYkz3IhTzOLUmgNPI1L8h5KgAAIbQqsAiAqsgKrojIFEgNDwOUXJPnTZTCO440VUIYBgAdN0MSLCqhq9a0xvKBQKAFFQshG70CXyZbpoJKoyFG1aQCm51vOIS0VttHLQry8yXW2k6QupMyvLYeUeT5AabPO%2B6CuIaRZCMYiBp8y9qQAIS5HkKolVVXwDQLjGLKEiEIBI7GLUDEDsALozVMdTSkLI4aoBH8iRlGCbR%2Fj81Sw6oQARxELkqDyABtEBnQAXQBvzgsO5KSso9KsPirKfTeu77M%2BnmtPTEzVCqjEarqhqmrKNhWrTdrOqobrEr6sdXpAIb1ptcbJuujaqCLOaFuUJbjrNwhDZ9LadupfafUOh3VuY3KPqu53brs%2FLwSe3kIf9jzLrYEgZAFQhQ454HQeUcGBvZZlRNh%2BHEeR1H0ehzG2GNHG8czons9JuxycEwt2RpumoSZlmfVZ9lEGUMAKF4NJv3SQh2L0KQyB4NdzyGak8DAMAoGRMgIAAFhQjgyH0ACpCAtgamhCBeAQKhat4WY5CAhKVPNthq1gxjhZAAAVGgoAq4LI9t90b7vhRXd2x%2BOUTl7BXySKowGUhEZNKRwTjWR0iAJycgXJgn%2FljDUWpcbGBflxcoQA%3D%3D%3D)

to get an auto-generated userinterface (based on <https://github.com/json-editor/json-editor>):

![grafik](https://github.com/user-attachments/assets/a83d885c-b345-4676-b3af-8a9a29ebfed3)

Populating `x-oold-range` in combination with a proper backend allows user to created non-inlined objects on the fly or link (= store the IRI) to existing ones (see <https://opensemantic.world> / <https://demo.open-semantic-lab.org>):

![grafik](https://github.com/user-attachments/assets/2e61fb48-b779-4b2d-88f3-c71098a605b5)

![grafik](https://github.com/user-attachments/assets/db298df5-d4f8-4d6c-9ab9-fb7de8314643)

Minor unsolved issues:

- `annotations` with object-values cannot be written in compact form, only with additional `value`-key in between
- some information already encoded in LinkML is not yet part of the generated JSON Schema (e.g. default values)

## NOMAD

[NOMAD schemas](https://nomad-lab.eu/prod/v1/docs/explanation/basics.html) have comparable concepts about reusable objects (sections) with typed properties (quantities). Example:

```yaml
definitions:
  sections:
    Element:
      quantities:
        label:
          type: str
        density:
          type: np.float64
          unit: g/cm**3
        isotopes:
          type: int
          shape: ['*']
    Composition:
      quantities:
        composition:
          type: str
      sub_sections:
        elements:
          section: Element
          repeats: true
```

can be expressed as the following JSON Schema (formated as yaml)

```yaml
definitions:
  sections:
    Element:
      properties:
        label:
          type: string
        density:
          type: number
          unit: g/cm**3
        isotopes:
          type: array
          items:
            type: integer
          format: table
    Composition:
      properties:
        composition:
          type: str
        elements:
          type: array
          format: table
          items:
            $ref: '#/definitions/sections/Element'
```

generating/validating the same JSON/YAML data (see also [playground](https://oo-ld.github.io/playground-yaml/?data=N4Ig9gDgLglmB2BnEAuUMDGCA2MBGqIAZglAIYDuApomALZUCsIANOHgFZUZQD62ZAJ5gArlELwwAJzplsrEIgwALKrNSgAAlnhQqAD3FoQVbGqq7kKEMqhQIiFAHonFAMwwAJk7V0wT5TJEAAUyKXE2ATxTQlt7RxclVVkAOmkAcyd4MgYQAF82TyoiGHgYWAQrUERuCqQNEABRMwZdBogpSCpwmBoGqJjjKEEIKkJEKClS9PzCi0RywQbh0YkROmipBREyoxBMjDoAKiO3WZAYWiguqpAVseswqSEFcrVb%2B8JSvXTu85IZGQ9uQ8GZ8nkCiAAML0CBgBZ1dqdUY9PrGLB0OEIuDwZYjB6KSbnUzmSx41aPKTPJZsAGyYFkUFjNhvOi3AAkUmKhAAxE4iiVdjjEE4ajxhU5mqTxBDZZDOdzrHyBaVyhKxXURTDMfC1QgFAKyCJsEZQOyMa09gAZMBkTwAAloDHthuNUBdQLI9uu9rhEGNQKo3tU9qonnK0mQbAxWL1uOsAAkAEwAeQUJMtVgA2qABvJEwb5otUAAGFIlislgAcbgA7IwWVcbqgswBGFhJlhuAC6BVzjMGIDTcyQxZQrZSrYALO2Lk3RtnWwA2Fit2urqu93uQxDKMAUXjdTpSKwXXTdMji%2FVsKDJAl4MBgKATZ4QKcKMgcMj6VCTERUNgAGsqCoCBeAQKgwCIXgADc5H%2FKwiDkGpIQ4Wh41AGNdURRNU3TFoLGfFt%2B2ifMQATQtR2GUty0rGt60bJ9mxQNsOy7XsWBIwdhxAIoqKWcdJxnRjrgXFtl1XddW03PJuzYc16EtQgbTtR16CDV0TQ9chvTAX1IADPRgyDMMIxPcEgA%3D)), e.g.

```yaml
composition: H2O
elements:
  - label: H
    density: 8.375e-05
    isotopes: [1, 2, 3]
  - label: O
    density: 1.141
    isotopes: [16, 17, 18]
```

by using the following mapping (work in progress):

| NOMAD Schema                      | JSON Schema                                          | Note                                                                              |
| --------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| quantities                        | properties                                           |                                                                                   |
| type (int, str, ...)              | type (integer, string, ...)                          | specific python types like `np.int32` can be annotated in the JSON-LD context     |
| unit, m_annotations, ..           | format / options                                     | additional custom annotation keywords can be kept or mapped to format and options |
| shape[*]                          | type: array, items: type: number                     | specific values can be mapped to minItems and maxItems                            |
| shape[*,*]                        | type: array, items: type: array, items: type: number | nested array                                                                      |
| sub_sections: ... : repeats: true | type: array, items: type: object                     | array of objects                                                                  |
| ...                               |                                                      |                                                                                   |

## Dlite

### Dlite Schema

[Dlite](https://github.com/SINTEF/dlite) already uses JSON Schema keywords like `properties`, `type` and `description`. Similar to NOMAD, annotations `unit` declare the unit of measure of quantity values and `shape` is used to describe array dimensions. However, different from NOMAD, `shape` refers to parameters declared under `dimensions`.

#### Person.dlite.yml

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

#### Person.oold.yml

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

### Instance

On the instance level the main difference is the nesting of properties within a `properties` subobject. This can be interpreted as JSON-LD [nested-properties](https://www.w3.org/TR/json-ld/#nested-properties). Links to other instance documents are UUIDs which should be interpreted as `urn:uuid`.

#### SherlockHolmes.dlite.yml

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

#### SherlockHolmes.oold.yml

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

## REST API Linked Data (x-jsonld-*)

[REST API Linked Data Keywords](https://datatracker.ietf.org/doc/html/draft-polli-restapi-ld-keywords-08) attaches a JSON-LD context to each JSON Schema / OpenAPI Schema Object via `x-jsonld-context` and `x-jsonld-type`, so that JSON-LD lives inside a document that OpenAPI 3.0 accepts (OpenAPI 3.0 rejects a top-level `@context`). This is the same "annotate JSON Schema in place" idea as OO-LD, delivered per class instead of per document. The mapping to and from OO-LD is mechanical and reversible; the forward direction (OO-LD to an OpenAPI 3.0 bundle) is shown in [Use Cases -> Delivery to OpenAPI, MCP and LLM tooling](use-cases.md). The reverse direction ingests a REST-API-LD Schema Object into an OO-LD schema:

### REST-API-LD (OpenAPI 3.0)

```json
{
  "components": {
    "schemas": {
      "Person": {
        "x-jsonld-context": { "schema": "http://schema.org/", "name": "schema:name" },
        "x-jsonld-type": ["schema:Person"],
        "type": "object",
        "properties": { "name": { "type": "string" } },
        "required": ["name"]
      }
    }
  }
}
```

### OO-LD Schema

```json
{
  "@context": { "schema": "http://schema.org/", "name": "schema:name" },
  "$id": "Person.schema.json",
  "x-oold-instance-rdf-type": ["schema:Person"],
  "title": "Person",
  "type": "object",
  "properties": { "name": { "type": "string" } },
  "required": ["name"]
}
```

`x-jsonld-context` maps to the top-level `@context` and `x-jsonld-type` to `x-oold-instance-rdf-type`. Both forms produce the same triples; a bundle of several classes becomes one OO-LD schema package with cross-schema `$ref`s.

## WoT JSON Schema in RDF

The W3C Web of Things note [JSON Schema in RDF](https://www.w3.org/2019/wot/json-schema) attaches a JSON-LD context to a schema's instances with the `jsonld:context` property, keeping the JSON Schema keywords and the instance context in one document - the closest standards precedent for OO-LD.

### WoT

```json
{
  "@context": { "jsonld": "http://www.w3.org/ns/json-ld#" },
  "jsonld:context": "http://schema.org",
  "type": "object",
  "description": "Schema of a commercial product with GTIN and manufacturer",
  "properties": {
    "gtin14": { "type": "string" },
    "manufacturer": { "type": "string" }
  }
}
```

### OO-LD Schema

```json
{
  "@context": "http://schema.org",
  "title": "Product",
  "description": "Schema of a commercial product with GTIN and manufacturer",
  "type": "object",
  "properties": {
    "gtin14": { "type": "string" },
    "manufacturer": { "type": "string" }
  }
}
```

The `jsonld:context` value becomes OO-LD's top-level `@context` (here a remote context URL). OO-LD does not wrap the context under a `jsonld:` term, so the schema document is itself directly consumable as a JSON-LD remote context.

## SPDX 3.0

[SPDX 3.0](https://spdx.github.io/spdx-spec/) is model-driven. Its primary notation is not JSON-LD but a **constrained-Markdown model** (one file per class/property in the [`spdx-3-model`](https://github.com/spdx/spdx-3-model) repository); a `spec-parser` then generates the OWL ontology with SHACL shapes, the JSON-LD context, and the JSON Schema. A document is validated both structurally (JSON Schema) and semantically (SHACL). OO-LD reaches the same dual validation from a single artefact - the OO-LD schema *is* the JSON Schema, and its `@context` yields the RDF that SHACL checks - without maintaining a separate generated schema and context.

### SPDX model (constrained Markdown, class `Package`, abbreviated)

```markdown
# Package

## Metadata

- name: Package
- SubclassOf: /Software/SoftwareArtifact

## Properties

- packageVersion
  - type: xsd:string
  - minCount: 0
  - maxCount: 1
- downloadLocation
  - type: xsd:anyURI
  - minCount: 0
  - maxCount: 1
```

### OO-LD Schema (the same class, single artefact)

```json
{
  "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
  "$id": "Package.schema.json",
  "title": "Package",
  "allOf": [{ "$ref": "SoftwareArtifact.schema.json" }],
  "properties": {
    "type": { "const": "software_Package" },
    "packageVersion": { "type": "string" },
    "downloadLocation": { "type": "string", "format": "uri" }
  }
}
```

| SPDX model construct | OO-LD |
| --- | --- |
| `# Name` / `name:` metadata | `title` plus the node `type` constant (IRI supplied by `@context`) |
| `SubclassOf: X` | `allOf: [{ "$ref": "X.schema.json" }]`, context inherited |
| property `type: xsd:*` | property `type` (with `@type` datatype coercion in `@context`) |
| `minCount: 1` | property listed in `required` |
| `maxCount: 1` (vs unbounded) | single value (otherwise `type: array`) |
| property name / path | a term IRI in `@context` |

The OO-LD schema reuses the SPDX-published JSON-LD context (a remote context), so the property names resolve to the same IRIs and datatypes SPDX defines and an instance validated against this schema expands to SPDX RDF. The difference is authoring: SPDX keeps the model, the JSON Schema and the context as three generated artefacts kept in sync by tooling; OO-LD keeps the one document.

## Croissant (MLCommons)

[Croissant](https://github.com/mlcommons/croissant) describes ML datasets as JSON-LD built on `schema.org/Dataset` plus the `cr:` vocabulary. Unlike SPDX or LinkML there is no separate model notation to compile: a Croissant document is authored directly as JSON-LD, so its primary notation is the instance-shaped document below. Because it is already JSON-LD, an OO-LD schema over the same terms adds structural validation while preserving the semantics.

### Croissant (JSON-LD, authored directly)

```json
{
  "@context": { "@vocab": "https://schema.org/", "cr": "http://mlcommons.org/croissant/" },
  "@type": "sc:Dataset",
  "name": "simple-pass",
  "recordSet": [
    {
      "@type": "cr:RecordSet",
      "@id": "images",
      "field": [
        { "@type": "cr:Field", "@id": "images/image_content", "dataType": "sc:ImageObject" }
      ]
    }
  ]
}
```

### OO-LD Schema

```json
{
  "@context": { "sc": "https://schema.org/", "cr": "http://mlcommons.org/croissant/", "type": "@type" },
  "$id": "Dataset.schema.json",
  "title": "Dataset",
  "type": "object",
  "properties": {
    "type": { "const": "sc:Dataset" },
    "name": { "type": "string" },
    "recordSet": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "const": "cr:RecordSet" },
          "field": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": { "const": "cr:Field" },
                "dataType": { "type": "string", "x-oold-range": "sc:ImageObject" }
              }
            }
          }
        }
      }
    }
  }
}
```

OO-LD adds structural validation (required fields, cardinalities) and a machine-checkable `x-oold-range` on `dataType`, on top of Croissant's JSON-LD semantics.

## Overlays Capture Architecture (OCA)

[OCA](https://oca.colossi.network/specification/) takes the opposite approach to a single unified document: a minimal capture base carries attribute names and core data types, and separate, content-addressed (SAID) overlays add labels, formats, units, encodings and mappings. OO-LD folds those concerns into one schema; the overlay types have direct OO-LD counterparts.

### OCA (capture base + label and conformance overlays, abbreviated)

```json
{
  "capture_base": {
    "type": "spec/capture_base/1.0",
    "attributes": { "full_name": "Text", "date_of_birth": "DateTime" }
  },
  "overlays": {
    "label": { "attribute_labels": { "full_name": "Full name", "date_of_birth": "Date of birth" } },
    "conformance": { "attribute_conformance": { "full_name": "M", "date_of_birth": "O" } }
  }
}
```

### OO-LD Schemas (modular, mirroring the overlays)

OO-LD composes with `$ref` plus a remote `@context` (see the guide's Composition section), so OCA's overlay structure maps directly onto **cross-referencing OO-LD schema modules**: a base capture schema carries the structure and core types, and each overlay becomes a small schema that references the base and contributes exactly one concern (labels, a localized label set, semantics, formats) - the same distributed-authorship pattern as OCA overlays.

Base capture schema (structure and core types only):
```json
{
  "$id": "Person.capture.schema.json",
  "type": "object",
  "properties": {
    "full_name": { "type": "string" },
    "date_of_birth": { "type": "string", "format": "date" }
  },
  "required": ["full_name"]
}
```

Label overlay - references the base and sets only labels (a second, differently-labelled overlay is just another such module):
```json
{
  "$id": "Person.label-en.schema.json",
  "allOf": [{ "$ref": "Person.capture.schema.json" }],
  "properties": {
    "full_name": { "title": "Full name" },
    "date_of_birth": { "title": "Date of birth" }
  }
}
```

Semantics overlay - references the base and adds only the `@context`:
```json
{
  "$id": "Person.semantics.schema.json",
  "@context": { "schema": "http://schema.org/", "full_name": "schema:name", "date_of_birth": "schema:birthDate" },
  "allOf": [{ "$ref": "Person.capture.schema.json" }]
}
```

The same concerns MAY also be consolidated into one OO-LD document when modularity is not needed; both forms are valid OO-LD.

| OCA overlay | OO-LD |
| --- | --- |
| capture base attribute + data type | `properties.<name>` with `type` / `format` |
| label overlay | `title` (and `x-oold-multilang-title` for languages) |
| conformance overlay (M/O) | `required` |
| unit / format / encoding overlay | `format`, `x-oold-ui-*` |
| attribute mapping overlay | `@context` term IRI |
| a whole overlay object | a schema module that `$ref`s the base and adds one concern |

The key difference is identity and semantics: OCA addresses overlays by content hash (SAID) and reaches meaning only through a separate attribute-mapping overlay, whereas OO-LD modules are addressed by resolvable `$id` and carry the IRIs natively in `@context`. When patching a schema owned elsewhere rather than layering new modules, OO-LD's own [overlay delivery](guide/extensions.md) (OpenAPI Overlay actions for `x-oold-ui-*`) provides the "patch without editing" pattern.

## jargon.sh

[jargon.sh](https://jargon.sh/) is a collaborative modelling platform. Its primary notation is a textual "models as code" description of classes and properties, authored in the web tool with a live diagram; the model is hosted in the platform rather than committed as a source file. From it jargon generates a JSON Schema, a JSON-LD context, an RDF/OWL ontology, OpenAPI and ReSpec documentation (used by UNECE / UNTP for Digital Product Passports). The two artefacts relevant here - the generated JSON Schema and JSON-LD context - recombine into one OO-LD document:

```text
jargon model  ->  Person.schema.json     (JSON Schema)
              ->  Person.context.jsonld   (JSON-LD @context)

OO-LD         =  { ...Person.schema.json, "@context": Person.context.jsonld["@context"] }
```

A jargon export therefore becomes an OO-LD schema mechanically (merge the generated `@context` into the generated JSON Schema), and conversely an OO-LD schema already carries both without a build step. The same recombination underlies the LinkML mapping above.

## TreeLDR

[TreeLDR](https://www.spruceid.dev/treeldr/treeldr-overview) (SpruceID, used in the Verifiable Credentials / DID space) centres on **RDF layouts**. Its primary notation is a JSON layout document that maps a tree value to and from an RDF dataset (`dehydrate` = tree to RDF, `hydrate` = RDF to tree). A layout is a `record` of `fields`, each binding a tree field to an RDF `property` IRI and a value layout (its datatype):

### TreeLDR layout (abbreviated)

```json
{
  "id": "https://example.org/#RecordLayout",
  "type": "record",
  "prefixes": { "tldr": "https://treeldr.org/prelude#" },
  "fields": {
    "id":   { "value": { "layout": "tldr:id" } },
    "name": { "value": "tldr:string", "property": "https://schema.org/name" }
  }
}
```

### OO-LD Schema

```json
{
  "@context": { "schema": "https://schema.org/", "name": "schema:name", "id": "@id" },
  "$id": "Record.schema.json",
  "type": "object",
  "properties": {
    "id":   { "type": "string", "format": "iri" },
    "name": { "type": "string" }
  }
}
```

A layout field's `property` becomes an `@context` term IRI, its value layout becomes the JSON Schema `type` (with `@type` coercion), and the field mapped to the node identity (`tldr:id`) becomes `@id`. TreeLDR's dehydrate/hydrate is exactly OO-LD's expansion (via `@context`) and framing (RDF back to the tree, see the guide) - so an OO-LD schema is a layout that additionally validates. TreeLDR also compiles to JSON Schema, JSON-LD contexts and SDKs; those artefacts recombine into an OO-LD schema as in the LinkML mapping above.

## yml2vocab

[yml2vocab](https://w3c.github.io/yml2vocab/) is a vocabulary-publishing tool (widely used by the W3C Verifiable Credentials community): from a short YAML term list it generates an RDFS vocabulary, a JSON-LD context and ReSpec HTML. It defines *terms*, not data schemas, so it is complementary to OO-LD: the context it produces is exactly what an OO-LD schema references in its `@context`.

### yml2vocab (YAML term list, abbreviated)

```yaml
vocab:
  - id: ex
    value: https://example.org/vocab#
class:
  - id: Person
property:
  - id: name
    domain: Person
```

### OO-LD Schema (consuming the generated vocabulary)

```json
{
  "@context": ["https://example.org/vocab/context.jsonld", { "type": "@type" }],
  "$id": "Person.schema.json",
  "title": "Person",
  "type": "object",
  "properties": {
    "type": { "const": "ex:Person" },
    "name": { "type": "string" }
  }
}
```

The vocabulary and context that yml2vocab publishes for `ex:Person` / `ex:name` are referenced directly by the OO-LD schema, so the term definitions stay owned by the vocabulary while the OO-LD schema adds structure.
