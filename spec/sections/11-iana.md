## IANA Considerations

| Slot | File extension (recommended) | Media type | RFC6906 profile | Description
| -- | --| -- | -- | -- |
| schema |*.schema.json | `application/oold-schema+json` | - | Full OO-LD schema
| schema |*.schema.json | `application/oold-schema+json` | oold-schema#bundled | Full OO-LD schema with all `$ref` and remote context bundled
| schema |*.schema.json | `application/oold-schema+json` | http://www.w3.org/ns/json-ld#context | Only the JSON-LD context
| schema |*.schema.json | `application/ld+json` | - | Only the JSON-LD context
| schema |*.schema.json | `application/schema+json` | - | Only the JSON Schema schema
| data |*.data.json | `application/oold-schema-instance+json` | - | Full OO-LD instance
| data |*.data.json | `application/ld+json` | http://www.w3.org/ns/json-ld#* | Full OO-LD instance. Profiles defined in https://www.w3.org/TR/json-ld/#iana-considerations apply
| data |*.data.json | `application/json` | - | Only the JSON data

### Security considerations

Both security consideration of [JSON-LD v1.1 section C](https://www.w3.org/TR/2020/REC-json-ld11-20200716/#iana-considerations) and [JSON Schema 2020-12 section 13](https://json-schema.org/draft/2020-12/json-schema-core#section-13) apply.

## Normative References

|||
| - | - |
| <a id="RFC2119"></a>RFC 2119 | Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, DOI 10.17487/RFC2119,                     March 1997, <https://www.rfc-editor.org/info/rfc2119>. 
| <a id="RFC8259"></a>RFC 8259 | Bray, T., Ed., "The JavaScript Object Notation (JSON) Data Interchange Format", STD 90, RFC 8259, DOI 10.17487/RFC8259,                      December 2017, <https://www.rfc-editor.org/info/rfc8259>. 
| <a id="JSONLD11"></a>JSON-LD | https://www.w3.org/TR/2020/REC-json-ld11-20200716/
| <a id="JSONSCHEMA202012"></a>JSON Schema | https://json-schema.org/draft/2020-12/json-schema-core
| <a id="LDP"></a>W3C.REC-ldp-20150226 | Speicher, S., Arwe, J., and A. Malhotra, "Linked Data Platform 1.0", World Wide Web Consortium Recommendation REC-ldp-20150226, 26 February 2015, <https://www.w3.org/TR/2015/REC-ldp-20150226>. 

## Informative References

|||
| - | - |
| <a id="RFC7049"></a>RFC 7049 | Bormann, C. and P. Hoffman, "Concise Binary Object Representation (CBOR)", RFC 7049, DOI 10.17487/RFC7049,                             October 2013, <https://www.rfc-editor.org/info/rfc7049>.


