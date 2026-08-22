# LinkML

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
