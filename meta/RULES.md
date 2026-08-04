# Rule catalog

`oold-rules.json` is the machine-readable catalog of the normative statements in the OO-LD
specification. Validators cite a rule id alongside every finding, so a report can point at the
requirement it enforces rather than only at its own internal check name.

The file is **generated** by `scripts/extract_rules.py` from the `:rule[...]` markers in
`spec/sections/*.md`. Do not edit it by hand.

## Marking a rule

```markdown
:rule[OOLD-RT-002]{applies=document summary="A strictly array-typed property must declare @container."}Because
the reconstruction MUST re-validate, a property that is *strictly* an array MUST declare `@container`.
```

| Attribute | Meaning |
|---|---|
| `applies` | `document` (checkable by validating a schema/instance), `implementation` (constrains a library; needs a conformance suite), or `advisory`. Default `document` |
| `summary` | One short line for a CLI. Optional; the opening sentence is used when absent |
| `checkable` | Override the default, which is true only for `document` rules |
| `since` | Override the release; defaults to the current tag |
| `deprecated` | `yes` to retire a rule. Its record stays in the catalog |
| `superseded_by` | Comma-separated ids that replace a deprecated rule |
| `in_note` | `yes` to allow a rule inside a `:::note`/`:::example`. See below |

`level` (MUST / SHOULD / ...) and `text` are extracted from the prose, never authored, so the
catalog cannot drift from the specification. `text` is the containing paragraph, or the containing
list item when the rule is a bullet.

## Ids are permanent

A code that can change is worse than no code, because people cite it in reviews, changelogs and
suppression comments.

**Ids are authored, never computed.** The number lives in the marker. `extract_rules.py` reads and
validates it but never assigns one: numbering by document position would renumber every following
rule the first time someone inserts a paragraph.

Two consequences:

- **Id order does not follow document order.** A new rule takes the next free number in its area
  wherever it is inserted, so `OOLD-RT-007` may appear above `OOLD-RT-003` in the rendered spec.
- **The area prefix is frozen at birth.** If a requirement later moves under a different heading it
  keeps its id; only the generated `section` field changes.

| Change to the spec | What happens to the id |
|---|---|
| New requirement | Next free number in the area |
| Requirement dropped | `deprecated=yes`. Never deleted, never reused |
| Requirement moves section | Unchanged |
| Reworded, same meaning | Unchanged; `text` and `text_sha256` update |
| **Meaning changed** | Deprecate the old id with `superseded_by`; mint a new one |
| One statement split in two | The original keeps the part that retains its meaning; the other gets a new id |
| Two merged | One survives; the other is deprecated, pointing at it |
| Meta-schema keyword renamed | Deprecate and mint a new id: the requirement now concerns a different keyword |

`scripts/check_spec.py` enforces this by comparing against the catalog in the most recent release
tag. It fails when a released id disappears, changes `area`/`level`/`applies_to`, or stops being
deprecated. Comparing against the tag rather than the working tree means ids can still be
reshuffled freely until a release ships a catalog.

## The baseline, and what forces a decision

`oold-rules.json` is generated, so it always shows the spec as it is now.
`rules-baseline.json` records the state a human last *accepted*: one line per rule id, holding
the sha256 of the text that was accepted. Comparing the two is what turns a silent event into a
stop.

| Situation | What happens |
|---|---|
| A new id appears | Recorded automatically. A new id cannot be a renamed rule, so there is nothing to decide |
| A rule's text changed | **Stops.** Only a human can tell a typo fix from a different requirement |
| An id vanished | **Stops.** Usually accidental: a rebase can take the sentence and drop the marker with it, without a conflict |

Accepting is deliberate and per-id:

```bash
make rules-accept IDS="OOLD-RT-002"
```

There is intentionally no accept-all. One keystroke that blesses every difference would wave an
accidental meaning-change through alongside a typo, which is the thing this guards against.

The pull request then shows one changed line in `rules-baseline.json` per accepted rule, which is
the reviewable claim: *this rule was reworded, not redefined*.

Two hooks run it (`pre-commit install`): `rules-extract` regenerates the catalogue and fails if it
changed, so a stale catalogue cannot be committed; `rules-baseline` then applies the table above.
`make check` runs the same guard, so CI catches it even without the hooks.

**What tooling cannot enforce.** No checker distinguishes a typo fix from a change of meaning. Each
record carries `text_sha256`, and because the catalog is committed, any rewording shows up as a
visible hash diff in review. Judging whether the meaning changed enough to need a new id is a
reviewer's job.

## Rules must live in normative prose

The conformance section states that notes and examples are non-normative. A `:rule[...]` marker
inside a `:::note` or `:::example` is therefore a contradiction, and extraction fails on it. Either
move the requirement into normative prose, or set `in_note=yes` if the placement is deliberate.

This is worth knowing when annotating: some requirements currently sit inside notes, which means
the specification asserts them somewhere it has declared non-normative.
