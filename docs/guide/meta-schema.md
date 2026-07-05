# Meta-schema & Vocabulary

OO-LD adds a small set of `x-oold-*` keywords on top of JSON Schema 2020-12. The OO-LD dialect is described by a meta-schema that extends the standard 2020-12 meta-schema and declares the OO-LD vocabulary as **optional**, so generic validators still accept OO-LD schemas. Declaring the vocabulary does not make a validator execute keyword behavior - that is supplied by OO-LD-aware tooling; the meta-schema only checks that the keywords are well-formed.

The `x-oold-*` keywords (generated from the meta-schema):

{{ vocabulary() }}

See [Meta-schema and Vocabulary](../spec/#meta-schema) in the specification for the normative details, including the `$vocabulary` declaration.
