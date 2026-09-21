# Contributing

## One source, everything else derived

`spec/sections/` is the normative source. Everything published under `/spec/` and `/rules/` is produced from it, and CI compares the committed artefacts byte for byte against a fresh render.

| what | where | who writes it |
|---|---|---|
| specification text | `spec/sections/*.md` | you |
| reader-facing guide | `docs/*.md`, `docs/guide/`, `docs/mappings/`, `docs/migration/` | you |
| meta-schemas | `meta/oold-*.json` | you |
| example and compliance schemas | `examples/`, `examples/compliance/` | you |
| rendered specification | `docs/spec/index.html` | `make spec` |
| rule catalogue | `meta/oold-rules.json`, `docs/rules.md` | `make spec` |
| schemas at their published paths | `docs/meta/`, `docs/schemas/` | `make stage-schemas`, not committed |
| explainer and tutorial media | release assets | CI, never committed |

Run `make spec` after touching the specification, and `make check` before opening a pull request. `make check` is what CI runs.

Edit through a branch and a pull request. Nothing is pushed to `main` directly.

## Editing the specification

```bash
git fetch --tags   # the rendered subtitle comes from git describe
make spec          # extract rules, render the specification, render the catalogue
make validate      # meta-schemas, examples, compliance corpus
uv run scripts/check_spec.py
```

`git fetch --tags` is not optional. The subtitle is derived from the nearest `v*` tag, so a shallow clone stamps the wrong version and fails the drift guard.

Commit the regenerated `docs/spec/index.html` with the change that caused it. CI diffs it byte for byte, so a source edit without a re-render fails.

Links written relative to the rendered specification (`../use-cases/`, `../meta/...`) only resolve on the deployed site. Each needs an entry in `.lycheeignore` or the link check fails.

## Rules and the catalogue

Every normative sentence carries a rule id, minted once and permanent:

1. Write the sentence with a placeholder: `:rule[OOLD-XX-?]{applies=... level=... summary="..."}`.
2. Run `make rules-mint` to fill the placeholder with a fresh id.
3. Run `make spec`, then `uv run scripts/rules_baseline.py accept <ID>` for each new or reworded rule.

The baseline hashes each rule's text, so a silent change of meaning under a stable id fails CI. Accepting is the deliberate act of saying the wording changed on purpose.

`MAY` is deliberately outside the recognised levels: the catalogue tracks obligations, and a permission is not one. Record permissions as prose.

## Cutting a release

A rule is authored before the release that carries it exists, so `extract_rules.py` records `since: unreleased`. Resolve it as part of tagging, never by hand:

```bash
uv run scripts/promote_since.py 1.0.0-rc.4   # unreleased -> the version being cut
make spec                                     # docs/rules.md picks up the resolved value
git commit && git tag v1.0.0-rc.4
```

Only `unreleased` entries change. Every other `since` records a release that has already shipped, and rewriting one turns the field into "whenever the generator last ran".

`OOLD_VERSION` in the `Makefile` pins the validator `make validate` runs. Bump it when a release of the reference implementation adds a check the specification now requires, or CI gates a release with a validator that predates its own rules.

## Compliance fixtures

`examples/compliance/` holds cases with a declared outcome, checked against the meta-schema. A rule with no fixture is a rule no implementation is held to, so prefer adding a case over adding a rule alone. `coverage.rules` reports which machine-checkable rules have no check behind them; treat that list as the backlog.

## Media

`media/explainer` and `media/tutorials` are rendered from source by CI and published as release assets. Nothing rendered is committed.

A pull request touching anything under `media/` gets the affected beats rendered at the pull request and at its merge base, and the beats whose pixels differ are posted as a comment. The palette arrives as an input prop, so a module-scope capture such as `const ink = colors.graph` freezes the light colours and the dark cut renders half light with no error anywhere. `scripts/check-theme.mjs` guards that.

## External vocabulary IRIs

Bind `http://schema.org/`, never `https://`. Both forms are permanent and schema.org serves both, so this is consistency rather than correctness: `http` is what [`jsonldcontext.json`](https://schema.org/docs/jsonldcontext.json) binds and therefore what a processor resolves, and it is what RO-Crate binds. Classes and properties take the same form, because `x-oold-sssom` object IRIs are compared by expansion and splitting them would join neither.

Mixing the two within one dataset is the failure mode, and it is silent: nothing errors, the triples simply do not join.

A consuming library disagreeing is handled at its boundary rather than by changing the corpus. rdflib binds `SDO` to `https://schema.org/` with no `http` variant, a choice its author described in [RDFLib/rdflib#1120](https://github.com/RDFLib/rdflib/issues/1120) as "a flip of the coin".

This inverts if schema.org changes `jsonldcontext.json` to `https`. At that point `http` becomes the legacy form and the corpus migrates in one sweep, coordinated with RO-Crate rather than ahead of it.

Downstream schema collections differ: [`oold-reference-schemas`](https://github.com/OO-LD/oold-reference-schemas) carries the `https` form as an `x-oold-context` synonym, because third-party data is written against those schemas. The examples here are illustrative, so a synonym on every term would be noise.

One carve-out: a page under `docs/mappings/` shows an external format beside its OO-LD equivalent, and the two are only equivalent if they name the same predicates. Those pages follow the format they map, so `croissant.md` and `treeldr.md` bind `https://schema.org/` on both sides. Changing one side alone would make the page assert a correspondence that does not hold.

## Style

- Write "JSON Schema" and "JSON-LD". Never "JSON-SCHEMA" or "JSON-Schema".
- No long dashes, no decorative comments, no emoji. A plain hyphen instead.
- Prose is not hard-wrapped: one line per paragraph. Markdown collapses soft breaks anyway, and wrapping only adds reflow noise to diffs.
