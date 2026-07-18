# From a Python dataclass

You already model data as Python dataclasses or [pydantic](https://docs.pydantic.dev/) models. OO-LD round-trips with them, so the schema and the code stay in sync:

- **Schema to code**: generate pydantic models from an OO-LD schema with [datamodel-code-generator](https://github.com/koxudaxi/datamodel-code-generator); the `@context` and `x-oold-*` keywords ride along in `json_schema_extra`.
- **Code to schema**: annotate a model's `model_config` with `@context` / `x-oold-iri` and emit OO-LD via pydantic's `model_json_schema()`.

Keep property names identifier-safe (`^[A-Za-z_][A-Za-z0-9_]*$`) and put the semantics in `@context` (alias `name` to `schema:name`), so you never need an IRI as a Python attribute name.

## 1. Plain pydantic

```python
from pydantic import BaseModel, ConfigDict

class Person(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "@context": {"schema": "https://schema.org/", "name": "schema:name"},
        "x-oold-iri": "schema:Person",
    })
    name: str | None = None
```

`model_json_schema()` emits a JSON Schema carrying that `@context` and `x-oold-iri` - a valid OO-LD schema, with no dependency beyond pydantic.

## 2. Switch to oold-python's `LinkedBaseModel`

The same model, with the base class swapped, becomes OO-LD-aware at runtime - resolving linked references by IRI, carrying `@id` identity, and serialising to JSON-LD:

```python
from pydantic import ConfigDict
from oold.model import LinkedBaseModel

class Person(LinkedBaseModel):
    model_config = ConfigDict(json_schema_extra={
        "@context": {"schema": "https://schema.org/", "name": "schema:name"},
        "x-oold-iri": "schema:Person",
    })
    name: str | None = None
```

See the [`oold` library](https://github.com/OO-LD/oold-python) (PyPI [`oold`](https://pypi.org/project/oold/)) for the additional features - reference resolution, `@id` handling, controllers, and JSON-LD import/export.

## Next steps

- [Use Cases](../use-cases.md) - code generation and workflows in depth.
- [Tooling](../tooling.md) - libraries and playgrounds.
