# Rule catalog

`oold-rules.json` is the machine-readable catalog of the normative statements in the OO-LD
specification. Validators cite a rule id alongside every finding, so a report can point at the
requirement it enforces rather than only at its own internal check name.

The file is **generated** by `scripts/extract_rules.py` from the `:rule[...]` markers in
`spec/sections/*.md`. Do not edit it by hand.

## Marking a rule

```markdown
:rule[OOLD-RT-08f2]{applies=document summary="A strictly array-typed property must declare @container."}Because
the reconstruction MUST re-validate, a property that is *strictly* an array MUST declare `@container`.
```

A new rule is written with a `?` in place of the suffix and minted before it is committed; see
[Ids are permanent](#ids-are-permanent-and-the-suffix-means-nothing).

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

## Ids are permanent, and the suffix means nothing

A code that can change is worse than no code, because people cite it in reviews, changelogs and
suppression comments.

An id is `OOLD-<AREA>-<4 hex characters>`. The suffix is minted at random and is unique across the
whole catalog, not merely within its area. It is deliberately meaningless: a sequential number
would imply an order the catalog does not have, and the first deprecation would tear a visible
hole in it. `OOLD-RT-002` sitting next to `OOLD-RT-004` reads as a rule missing from the page
rather than one retired from the specification.

**An author never picks a suffix**, because there is nothing to pick. Write a `?` and let the tool
fill it in:

```markdown
:rule[OOLD-RT-?]{applies=document summary="..."}A property that is *strictly* an array MUST ...
```

```bash
make rules-mint     # prints OOLD-RT-? -> OOLD-RT-08f2, and rewrites the marker in place
```

`extract_rules.py` refuses to run while a placeholder is unfilled and names the fix, so a marker
cannot reach the catalog without an id. Minting is append-only: an id that already has a suffix is
never touched, so running `make rules-mint` again is always safe. The pool it draws from is every
id the catalog, the baseline and the prose have ever held, so a retired id can never come back
under a new meaning.

Two consequences:

- **Id order carries no information.** The suffix is not a counter, so nothing can be inferred from
  one id sorting above another, and no id is ever "missing". Navigate the specification by section
  and the catalog by the rule catalogue page.
- **The area prefix is frozen at birth.** If a requirement later moves under a different heading it
  keeps its id; only the generated `section` field changes.

| Change to the spec | What happens to the id |
|---|---|
| New requirement | A `?` placeholder, filled by `make rules-mint` |
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
| A new id appears | Recorded automatically, and **reported**: a new rule usually means new work in oold-python |
| A rule's text changed | **Stops.** Only a human can tell a typo fix from a different requirement |
| An id vanished | **Stops.** Usually accidental: a rebase can take the sentence and drop the marker with it, without a conflict |
| A rule is deprecated | Recorded and **reported**: downstream should stop enforcing it. Tracked separately because `deprecated=yes` leaves the text, and therefore the hash, unchanged |
| A deprecated rule is un-deprecated | **Stops.** A retired id stays retired; reports already cite it. Mint a new id instead |

Accepting is deliberate and per-id:

```bash
make rules-accept IDS="OOLD-RT-08f2"
```

There is intentionally no accept-all. One keystroke that blesses every difference would wave an
accidental meaning-change through alongside a typo, which is the thing this guards against.

The pull request then shows one changed line in `rules-baseline.json` per accepted rule, which is
the reviewable claim: *this rule was reworded, not redefined*.

Adding or retiring a rule does not block, but it is never silent. Both print what the change
implies for the Python validator, and link to
[how to turn a rule into a check](https://github.com/OO-LD/oold-python/blob/main/CONTRIBUTING.md#translating-a-specification-rule).
The one-off report says the work exists; the standing gap is tracked downstream by
`oold rules list --unchecked`.

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
