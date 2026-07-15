# Use cases

Because an OO-LD schema is a plain JSON Schema carrying a JSON-LD context, it can drive a wide range of tooling from a single source. This page collects the main use cases.

## Code Generation

In general, we want to keep keywords in 'instance' JSON-documents (=> property names in schemas) strict `^[A-z_]+ [A-z0-9_]*$` to avoid escaping or replacing when mapping to other languages. This works well with [aliasing](https://www.w3.org/TR/json-ld11/#aliasing-keywords), e.g.

```json
{
  "@context": {
    "ex": "https://example.org/",
    "schema": "http://schema.org/",
    "name": "schema:name",
    "type": "@type"
  },
  "x-oold-iri": "ex:RawData",
  "title": "Person",
  "type": "object",
  "properties": {
    "type": {
      "type": "array",
      "items": { "type": "string"},
      "default": ["schema:Person"]
    },
    "name": {
      "type": "string",
      "description": "First and Last name"
    }
  }
}
```

### Python

The Person schema above translates smoothly to python (pydantic) via <https://github.com/koxudaxi/datamodel-code-generator>:

```py
class Person(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "@context": {
                "ex": "https://example.org/",
                "schema": "https://schema.org/",
                "name": "schema:name",
                "type": "@type"
            },
            "x-oold-iri": "ex:RawData",  # the IRI of the class
        }
    )
    type: Optional[str] = "schema:Person"
    name: Optional[str] = None
    """First and Last name"""
```

what would not be the case if we use `@type` or `schema:name` as property names (See also [python playground](https://oo-ld.github.io/playground-python-yaml/)). From pydantic it's also straight forward to (re)generate OO-LD and  [OpenAPI-Schemas](https://docs.pydantic.dev/latest/concepts/json_schema/), especially via [FastAPI](https://fastapi.tiangolo.com/features/).

## Workflows and Code Analysis

A common ground for workflow definitions are decorated dataclass-typed functions that are managed by a workflow-environment like [prefect](https://github.com/PrefectHQ/prefect).

```py
@flow
def my_node(param: MyInputClass) -> MyOutputClass:
  ...
  return MyOutputClass(...)
```

If these dataclasses are following OO-LD annotations as described above the semantics of the workflow (node) is inherently contained.

In this regard, OO-LD can be combined with standard code compiler/interpreter tooling, especially [Abstract Syntax Trees](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and tracing provide a semantic description of software-defined workflows. More information see [AWL](https://github.com/OO-LD/awl-schema)

## Integration with Large Language Models

Recent support of Large Language Models (LLMs) for [structured output](https://python.langchain.com/docs/how_to/structured_output/) is based on JSON Schema. This allows the direct application of OO-LD schemas with LLMs in order to generate, complete or validate structured data. Example use cases see [osw-chatbot](https://github.com/opensemanticworld/osw-chatbot/)

## Delivery to OpenAPI, MCP and LLM tooling

An OO-LD schema carries its semantics in the top-level `@context`. When the schema is handed to OpenAPI tooling, an MCP client or an LLM, the goal is to keep those semantics *available* to the model (as grounding) and to downstream RDF - not to make the consumer emit `@context` in its output. With `additionalProperties: false` an instance stays limited to its declared `properties`, so `@context` remains schema-level metadata and is never produced as data.

| Consumer                                                             | `@context` handling                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| JSON-LD / OO-LD-aware tools                                          | native top-level `@context` (+ `x-oold-*`)                |
| OpenAPI 3.1                                                          | native `@context` (arbitrary keywords allowed)            |
| MCP `inputSchema` / `outputSchema`, LLM tool-use / structured output | native `@context` - carried through and used as grounding |
| OpenAPI 3.0, especially a bundle of several classes                  | per-schema `x-jsonld-context` / `x-jsonld-type`           |
| strict structured-output subset that rejects unknown keywords        | IRIs folded into `title` / `description`                  |

**MCP and tool-use / structured output.** An [MCP](https://modelcontextprotocol.io) tool's `inputSchema` (and the `outputSchema` added in the 2025-06-18 revision) is an ordinary JSON Schema object whose keywords MCP does not restrict, so a top-level `@context` is carried through unchanged over `tools/list`. Tool-use and structured-output APIs accept such a schema, and the model uses the context as grounding: in a roundtrip where an MCP server advertised a tool with two opaque properties `a` and `b` mapped through `@context` to `schema:familyName` and `schema:givenName`, the client received the `@context` intact and the model filled the fields by the IRIs (`a = "Mustermann"`, `b = "Max"`) rather than by surface order. An OO-LD schema can therefore be used directly as an MCP tool schema or a structured-output schema, with no relocation. The exception is a strict provider subset that rejects unknown keywords; there, fold the IRIs into the `title` / `description` annotations the model also reads.

**OpenAPI.** OpenAPI 3.1 Schema Objects are JSON Schema 2020-12 and accept arbitrary keywords, so the native `@context` is used as-is. OpenAPI 3.0 Schema Objects reject unregistered keywords unless prefixed with `x-`, and a single OpenAPI document usually bundles several classes under `components/schemas`, where there is no document root to host one `@context`. Both are addressed by the IETF draft [REST API Linked Data Keywords](https://datatracker.ietf.org/doc/html/draft-polli-restapi-ld-keywords-08), which places a JSON-LD context and type on **each** Schema Object via `x-jsonld-context` and `x-jsonld-type` (valid for all OpenAPI versions >= 3.0). An OO-LD schema maps to them per class, mechanically and losslessly: `@context` -> `x-jsonld-context` (whose value is any valid JSON-LD context - object, array, or URL string, [draft Section 2.2](https://datatracker.ietf.org/doc/html/draft-polli-restapi-ld-keywords-08#section-2.2)), and `x-oold-instance-rdf-type` -> `x-jsonld-type` (whose value is whatever the JSON-LD `@type` keyword accepts - a single IRI or an array of IRIs, [JSON-LD 1.1 Section 3.5](https://www.w3.org/TR/json-ld11/#specifying-the-type)). The mapping is reversible, so an OpenAPI 3.0 export can be read back into an OO-LD schema.

For example, this OO-LD schema:

```json
{
  "$id": "https://example.org/Person.schema.json",
  "@context": { "schema": "http://schema.org/", "name": "schema:name" },
  "x-oold-instance-rdf-type": ["schema:Person"],
  "type": "object",
  "properties": { "name": { "type": "string" } },
  "required": ["name"]
}
```

maps to the following OpenAPI 3.0 document, one Schema Object per class (the `$id` becomes the `components/schemas` key, and a cross-class `$ref` is rewritten to `#/components/schemas/<Class>`):

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

## Structured knowledge bases (the "LLM Wiki" pattern)

An LLM-maintained knowledge base only *compounds* if what accumulates is structured. Unqualified links and free text do not scale - a personal wiki decays to prose and dead links within a couple of years, a team or corporate one faster - because every question forces the model to re-read and re-derive. What accumulates value is typed, queryable entities.

OO-LD gives each entry a schema-defined structured payload alongside its prose. Because an OO-LD schema is at once a JSON Schema and a JSON-LD context, the *same* schema (a) generates the human edit form, (b) constrains LLM structured-output extraction, and (c) yields an RDF knowledge graph queryable with SPARQL across all entries - so "find contradictions, orphans or duplicates" becomes a graph query rather than a re-read.

The workflow this enables, and where current research sits, is the ingest loop: take an unstructured knowledge chunk, select the schema(s) that represent it, then fill them correctly *and* deduplicate against entities that already exist. That last step - entity resolution against a live graph - is the hard part. [OpenSemanticLab](https://github.com/OpenSemanticLab) is the reference implementation of this pattern; the broader idea is discussed in the [Reference](reference.md#discussion) pointers.
