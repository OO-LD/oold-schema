# Upgrading to 1.0.0

What changed since `1.0.0-rc.3`, and what a document or a tool has to do about it. Nineteen rules were added across rc.4 and rc.5; the ones below are the only ones that can make something that worked stop working.

## A schema document must carry a root `@context`

`OOLD-SCH-96a3`, and the one change most likely to affect you. The meta-schema enforces it: `required` is now `["$id", "@context"]`.

```json
{
  "$id": "Person.schema.json",
  "@context": {},
  "type": "object"
}
```

The requirement is presence, not content. An empty object satisfies it, as does a bare reference to a remote context. A schema that maps no terms yet is still conforming; what it cannot do is omit the entry, because that is the one thing that makes the document unusable as a referenceable context.

Why it is a `MUST` rather than a recommendation: without a root `@context`, [JSON-LD 1.1 Context Processing](https://www.w3.org/TR/json-ld11-api/) aborts with `invalid remote context` when something references the schema. The schema validated, and then failed inside a consumer's processor, far from the document that caused it.

**To upgrade:** add `"@context": {}` to any schema document that lacks one. Seventeen fixtures in this repository needed exactly that.

## `x-oold-reverse-default-properties` is gone

Removed from the vocabulary. A schema still carrying it is rejected by the meta-schema, which does not define it.

## A bare IRI reference needs `@type: "@id"` on its term

`OOLD-INS-770a`. Where a property's range is references only and its value is written as a bare IRI string, the term must coerce:

```json
"@context": { "works_for": { "@id": "schema:worksFor", "@type": "@id" } }
```

Without the coercion the value expands as a literal, not a node reference, and the round trip does not return what went in.

## `x-oold-range` and `x-oold-ref` name a URI reference

`OOLD-EXT-3ea9`. The value is resolved against the base URI, exactly as a `$ref` target is. It is not a compact IRI, so the prefixes of the schema's own `@context` do not apply: `"ex:Organization"` names a relative path, not the term `ex:Organization`. If you relied on prefix expansion here, it was never specified and did not work uniformly.

## Seven statements became normative

rc.3 promoted requirements that had been stated in the indicative mood, so they bound nobody and the rule catalogue could not see them. A tool that conformed to rc.3 prose may not conform now, without any prose having changed meaning: `OOLD-EXT-eeda`, `OOLD-EXT-44bd`, `OOLD-VER-9846`, `OOLD-EXT-c77a`, `OOLD-INS-770a`, `OOLD-SCH-cfb8`, and a strengthened `OOLD-EXT-68fa`.

## Frame derivation is specified

If you derive JSON-LD frames from schemas, this is new normative ground rather than a change: `OOLD-EXT-68fa`, `-6d10`, `-ff64`, `-05d3`, `-5ea6` and `-725f` together say which properties are reference-valued, what precedence applies when signals overlap, and what framing a graph yields.

The practical consequence: a reference-valued property takes `{"@embed": "@never"}`, so its targets stay IRIs. Without it, a reference whose target happens to carry triples in the same graph is embedded as an object, and the framed document stops validating against the schema its own frame came from. Both reference implementations had this wrong until rc.5.

## The meta-schema recurses statically

A nested malformed `x-oold-*` keyword that slipped past a validator without `$dynamicRef` support is now caught. Nothing to change in a document; a schema that was quietly wrong may start failing.

## Checking a schema

```bash
uvx --from "oold[validation]" oold validate path/to/schemas
```

The released library tracks the specification, so this reports against the rules above rather than an older set.
