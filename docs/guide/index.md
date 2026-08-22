# Guide

This guide is a non-normative walk-through of OO-LD Schema. It follows the same orientation as the [JSON-LD specification](https://www.w3.org/TR/json-ld/): each concept is introduced with a short explanation and worked examples. For the exact, normative rules - and the RFC 2119 keywords - always refer to the [Specification](../spec/).

## OO-LD Concepts

- [Basic Concepts](basic-concepts.md) - how one document serves as both a JSON Schema and a JSON-LD context, and how inheritance is expressed.
- [Composition](composition.md) - assembling complex types from independent schemas, merging remote contexts, and the merge-and-override model.
- [Schema Instances](schema-instances.md) - how instances reference their schema (`@context`, `$schema`), carry identity (`@id`), and carry their semantic type.
- [Identification & Versioning](identification-versioning.md) - `$id`, `x-oold-uuid`, schema-level ontology correspondence (`x-oold-sssom`), and version keywords.
- [Extensions](extensions.md) - the JSON-LD and JSON Schema extensions OO-LD adds (`@version`, term mappings / synonyms, multilanguage, `x-oold-range`, reverse properties, UI generation).
- [Meta-schema & Vocabulary](meta-schema.md) - the OO-LD dialect meta-schema and the full `x-oold-*` keyword table.

## Beyond the concepts

- [Tooling](../tooling.md) - generic tooling, OO-LD-specific implementations, and interactive playgrounds.
- [Mappings](../mappings/index.md) - how selected formats (Asset Administration Shell, SAMM, LinkML, NOMAD, DLite, ...) map to OO-LD schemas and instances.
- [Migration](../migration/index.md) - reach OO-LD from where you already are: JSON Schema, RDF / JSON-LD, OWL or SHACL, a Python dataclass, or a legacy OSW schema.
- [Related Work](../related-work.md) - how OO-LD compares to related schema languages and data models, plus the package registry and discussion pointers.
