# Guide

This guide is the normative walk-through of the OO-LD Schema. It follows the same orientation as the [JSON-LD specification](https://www.w3.org/TR/json-ld/): each concept is introduced with a short explanation and worked examples.

The keywords "MUST", "MUST NOT", "SHOULD", "MAY", etc. are used as defined in [RFC 2119](https://www.rfc-editor.org/info/rfc2119) (see [Conventions and Terminology](../introduction.md#conventions-and-terminology)).

## Contents

- [Basic Concepts](basic-concepts.md) - how one document serves as both a JSON Schema and a JSON-LD context, and how inheritance is expressed.
- [Composition](composition.md) - assembling complex types from independent schemas, merging remote contexts, and the merge-and-override model.
- [Schema Instances](schema-instances.md) - how instances reference their schema (`@context`, `$schema`), carry identity (`@id`), and carry their semantic type.
- [Identification & Versioning](identification-versioning.md) - `$id`, `x-oold-uuid`, the ontology class IRI (`x-oold-iri`), and version keywords.
- [Extensions](extensions.md) - the JSON-LD and JSON Schema extensions OO-LD adds (`@version`, multi-mapping, multilanguage, `x-oold-range`, reverse properties, UI generation).
- [Meta-schema & Vocabulary](meta-schema.md) - the OO-LD dialect meta-schema and the full `x-oold-*` keyword table.
