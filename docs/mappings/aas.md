# Asset Administration Shell

Asset Administration Shell combines schema and data in a single documents. Semantics are introduced by annotations keywords.

## AAS

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

## OO-LD Schemas

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

## OO-LD Data

```yml
"@context": https://example.org/Simple_Submodel
$schema: https://example.org/Simple_Submodel
ExampleProperty: exampleValue
```
