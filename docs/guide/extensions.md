# Standard extensions

On top of plain JSON Schema and JSON-LD, OO-LD defines a small set of extensions. They fall into two groups.

**JSON-LD side**

- **Processing mode (`@version`)** - OO-LD relies on JSON-LD 1.1 features (scoped contexts), so contexts should declare `"@version": 1.1`.
- **Multi-Mapping** - a `<property>*` notation documents alternative IRI mappings for a term (redesign tracked in [#12](https://github.com/OO-LD/schema/issues/12)).

**JSON Schema side**

- **JSON Schema 2020-12** is the required dialect (composition places `$ref` next to sibling keywords, only honored from 2019-09 onward).
- **Multilanguage** - `x-oold-multilang-title` / `x-oold-multilang-description` localize a schema's own labels; instance *values* are localized with standard JSON-LD language maps.
- **Range (`x-oold-range`)** - constrains the type of a referenced object (an IRI, a union of IRIs, or an inline subschema); references inside it use `x-oold-ref`, not `$ref`.
- **Reverse properties** (`x-oold-reverse-*`) - edit a symmetric relation from both sides, mapped with JSON-LD `@reverse`.
- **UI Generation** (`x-oold-ui-*`) - a portable vocabulary of form/view hints (widget, order, grouping, visibility, enum labels), with vendor pass-through (`x-jedison-*`) and delivery inline or via an overlay.

For the normative rules and worked examples of every keyword above, see [Standard Extensions](../spec/#extensions) in the specification.
