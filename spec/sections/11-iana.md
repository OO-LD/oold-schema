## IANA Considerations {#iana}

`application/oold-schema+json` and `application/oold-schema-instance+json` are the names this specification uses. Neither is registered with IANA yet, and registration is tracked in [issue 13](https://github.com/OO-LD/oold-schema/issues/13). Until it completes, a deployment that needs a registered type serves `application/ld+json` or `application/schema+json`, both of which the table below already assigns to the relevant view of a document.

| Slot | File extension | Media type | RFC 6906 profile | Description |
|---|---|---|---|---|
| schema | *.schema.json | `application/oold-schema+json` | - | Full OO-LD schema |
| schema | *.schema.json | `application/oold-schema+json` | oold-schema#bundled | Full OO-LD schema with all `$ref` and remote context bundled |
| schema | *.schema.json | `application/oold-schema+json` | `http://www.w3.org/ns/json-ld#context` | Only the JSON-LD context |
| schema | *.schema.json | `application/ld+json` | - | Only the JSON-LD context |
| schema | *.schema.json | `application/schema+json` | - | Only the JSON Schema schema |
| data | *.data.json | `application/oold-schema-instance+json` | - | Full OO-LD instance |
| data | *.data.json | `application/ld+json` | `http://www.w3.org/ns/json-ld#*` | Full OO-LD instance; the profiles defined in [[JSON-LD11]] IANA considerations apply |
| data | *.data.json | `application/json` | - | Only the JSON data |

### Security Considerations {#security}

Both the security considerations of [[JSON-LD11]] (§C) and of [[JSONSCHEMA]] (§13) apply. In particular, as [](#referencing-schema) recommends, a consumer does not blindly trust the schema an instance declares for itself (a crafted instance could point at a permissive schema) and remains responsible for validating against a schema it trusts.
