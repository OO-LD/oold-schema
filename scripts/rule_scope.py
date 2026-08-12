#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Where a rule's marked sentence ends, shared by extraction and rendering.

`scripts/extract_rules.py` used to take the *whole containing paragraph* as a rule's `text`,
with a comment explaining why: splitting prose into sentences breaks on abbreviations (`e.g.`)
and on periods sitting inside a code span (`` `x.y.z` ``). That reasoning was correct about the
hazards, but block granularity paid for avoiding them with a paragraph that mixes one
requirement with the explanation around it - so a typo fixed three sentences later still trips
the rule-baseline guard and demands a human re-acceptance for a wording nobody changed.

The narrower cut is safe because of two facts confirmed across the whole marked corpus: no
marked paragraph is soft-wrapped, so a sentence never spans a line break, and a marker sits at
the start of the statement it names. So this module does not do general sentence splitting; it
finds *one* boundary, searched forward from a known position, on a single source line. The
hazards the old comment warned about are handled explicitly instead of avoided:

- a period inside `` `...` `` is masked out before scanning, so it can never end a sentence -
  this is the single biggest source of wrong boundaries in the marked prose;
- `e.g.`, `i.e.`, `cf.`, `vs.`, `etc.`, `approx.` and `resp.` (case-insensitive) do not end a
  sentence either;
- an ellipsis (`...`) does not end a sentence;
- a decimal or version number (`2020-12`, `1.1`) is not mistaken for one, because a boundary
  requires whitespace and then a capital letter (or an opening bracket/quote/backtick) right
  after the terminator - a digit or a lowercase continuation never satisfies that.

If no boundary is found, the sentence runs to the end of the text. That is expected, not a
failure: a good number of markers sit on an already single-sentence line.

Used by scripts/extract_rules.py to compute a rule's `text`, and by scripts/render_spec.py to
wrap the same span in the rendered HTML. Both importing this one function - rather than each
growing its own copy - is what keeps the catalogue and the spec page agreeing on what a rule's
sentence actually is.
"""

from __future__ import annotations

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rule_ids import MARKER  # noqa: E402  - the marker itself ends a sentence; see sentence_end

#: A sentence-ending punctuation mark. `!` and `?` need none of the abbreviation/ellipsis
#: handling below - nothing in the corpus abbreviates with them.
TERMINATOR = re.compile(r"[.!?]")

#: What is allowed to start the next sentence. A capital letter is the common case; the rest is
#: the markup a sentence in this specification is routinely opened with - an inline code span, a
#: cross-reference (`[`), a parenthetical, emphasis (`*`), or a quotation (straight or curly).
TRIGGER = re.compile("[A-Z`\\[(*\"'‘“]")

#: Whitespace directly after the terminator. Only spaces and tabs: the text handed to
#: `sentence_end` is always a single source line, so a newline never appears inside it.
WHITESPACE = re.compile(r"[ \t]+")

#: Do not end a sentence, even though each ends in a period. Checked case-insensitively so
#: `E.g.` at the start of a sentence is still caught.
ABBREVIATIONS = ("e.g.", "i.e.", "cf.", "vs.", "etc.", "approx.", "resp.")

#: A code span, `` `...` ``. This specification never nests a backtick inside one, so "no
#: backtick until the next backtick" is exact, not merely a lazy-quantifier approximation.
CODE_SPAN = re.compile(r"`[^`]*`")

#: Markup that closes *after* the terminator and still belongs to the sentence, as in
#: `**Propagation (`@propagate`).** A $ref inside ...`. Without this the period is not followed
#: by whitespace, no boundary is found, and the sentence swallows the one after it. Cutting
#: between the `.` and the `**` would be worse still: it would leave the emphasis unbalanced in
#: the HTML that render_spec.py wraps around this exact span.
CLOSERS = re.compile("[*_`\")'\\]’”]*")

#: The bullet or numeral introducing a list item. Its period is not a sentence terminator: a line
#: opening `1. **Value-form** ...` would otherwise end its first "sentence" at `1.`, since `*` is
#: a legitimate opener. Narrow on purpose - a period after a digit is a real boundary in ordinary
#: prose (`... canonicalized per RFC 8785. The next sentence ...`), so only the leading marker of
#: the line is exempt.
LIST_MARKER = re.compile(r"^\s*(?:[-*+]|\d+\.)\s")


def _code_span_ranges(text: str) -> list[tuple[int, int]]:
    """Half-open `[start, end)` ranges covered by a code span in `text`."""
    return [m.span() for m in CODE_SPAN.finditer(text)]


def _inside_code_span(ranges: list[tuple[int, int]], index: int) -> bool:
    return any(start <= index < end for start, end in ranges)


def _is_abbreviation(text: str, index: int) -> bool:
    """Whether the period at `index` closes one of :data:`ABBREVIATIONS`, not a sentence.

    Matched case-insensitively against the characters ending at `index`, then guarded by a word
    boundary on the left so an abbreviation is never matched as the tail of a longer word.
    """
    lower = text.lower()
    for abbr in ABBREVIATIONS:
        start = index - len(abbr) + 1
        if start < 0 or lower[start : index + 1] != abbr:
            continue
        preceding = text[start - 1] if start > 0 else ""
        if not (preceding.isalnum() or preceding == "_"):
            return True
    return False


def _is_ellipsis(text: str, index: int) -> bool:
    """Whether the period at `index` belongs to a run of three or more (an ellipsis)."""
    start = index
    while start > 0 and text[start - 1] == ".":
        start -= 1
    end = index
    while end + 1 < len(text) and text[end + 1] == ".":
        end += 1
    return end - start + 1 >= 3


def sentence_end(text: str, start: int) -> int:
    """The index just past the sentence beginning at `start`.

    A boundary is a `.`, `!` or `?` - not inside a code span, not an abbreviation, not part of an
    ellipsis, not the numeral of a list item - optionally followed by markup closing the sentence
    (`**`, a quote, a bracket), then whitespace, then a capital letter or one of `` ` [ ( * " ' ``.
    That trailing check is what tells a real sentence break from a decimal or a version number:
    `2020-12` and `1.1` are followed by a digit or by nothing whitespace-then-capital can
    satisfy, never by whitespace and then a capital letter.

    The returned index is past any such closing markup, so the span is always balanced.

    If no such boundary exists, the sentence runs to the end of `text`.
    """
    ranges = _code_span_ranges(text)
    bullet = LIST_MARKER.match(text)

    # The next marker ends this sentence whatever the punctuation says, because it opens the next
    # rule's sentence. Without this, two consecutive sentences that are both rules merge into one:
    # the period before the marker is followed by `:rule[`, not by whitespace and a capital, so no
    # boundary is recognised and the first rule swallows the second's text verbatim.
    following = MARKER.search(text, start)
    limit = following.start() if following else len(text)

    for match in TERMINATOR.finditer(text, start):
        index = match.start()
        if index >= limit:
            break
        if bullet and index < bullet.end():
            continue
        if _inside_code_span(ranges, index):
            continue
        if text[index] == "." and (_is_abbreviation(text, index) or _is_ellipsis(text, index)):
            continue
        closers = CLOSERS.match(text, index + 1)
        whitespace = WHITESPACE.match(text, closers.end())
        if not whitespace:
            continue
        if TRIGGER.match(text, whitespace.end()):
            return closers.end()
    return len(text[:limit].rstrip())
