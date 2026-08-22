# Semantic Aspect Meta Model

[Semantic Aspect Meta Model (SAMM)](https://docs.bosch-semantic-stack.com/oss/samm-specification.html) is a lightweight language to model (partial) objects (aspects) and their properties. While building on RDF and using turtle as serialization SAMM forms tree like structures like JSON Schema. Instead of IRIs, Ressources are identified with URNs which are not meant to be resolveable in the sense of linked data / semantic web.

Example (see [AddressAspect.ttl](https://github.com/eclipse-tractusx/sldt-semantic-models/blob/main/io.catenax.shared.address_characteristic/4.0.0/AddressAspect.ttl) for an address, stripping everything but the post code attribute):

## SAMM

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

## OO-LD Schema Example

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

## Data instance

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
