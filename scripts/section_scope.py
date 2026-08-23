#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Which parts of a section file are non-normative, shared by rendering and extraction.

The conformance section declares that "as well as sections marked as non-normative, all authoring
guidelines, diagrams, examples, and notes in this specification are non-normative". Two mechanisms
express that: the `:::note` / `:::example` blocks that `extract_rules.non_normative_blocks` already
handles, and a heading marked `.informative`, which is what this module covers.

`scripts/render_spec.py` acted on the second and `scripts/extract_rules.py` did not, so a
`:rule[...]` placed in an informative section was rendered without RFC 2119 markup and catalogued
as normative anyway - the catalogue asserting a requirement the specification disclaims on the same
page. Nothing exploited that, but only because no marker had been written there yet.

The rule itself is small and lives in :func:`is_informative`, so the renderer and the extractor
cannot disagree about it. Its inheritance is the part worth stating: `informative` propagates to
every descendant heading, so marking a level-4 section covers the level-5 sections beneath it.
"""

from __future__ import annotations

import re

#: An ATX heading, level 2 to 6. Level 1 is the document title and carries no section.
HEADING = re.compile(r"^(#{2,6})\s+(.*?)\s*$")

#: The trailing `{#id .class}` attribute block on a heading.
ATTRS = re.compile(r"\s*\{([^}]*)\}\s*$")

#: Section ids that are non-normative whatever they declare, because what they are is structural
#: rather than a choice: the generated index, and the introduction.
ALWAYS_INFORMATIVE = ("index", "introduction")


def parse_heading(line: str) -> tuple[int, str | None, list[str]] | None:
    """`(level, id, classes)` for a heading line, or None if the line is not one."""
    match = HEADING.match(line)
    if not match:
        return None
    level, title = len(match.group(1)), match.group(2)
    node_id, classes = None, []
    attrs = ATTRS.search(title)
    if attrs:
        for token in attrs.group(1).split():
            if token.startswith("#"):
                node_id = token[1:]
            elif token.startswith("."):
                classes.append(token[1:])
    return level, node_id, classes


def is_informative(node_id: str | None, classes: list[str], parent_informative: bool) -> bool:
    """Whether a section is non-normative, given its own markers and its parent's state."""
    return parent_informative or "informative" in classes or node_id in ALWAYS_INFORMATIVE


def informative_lines(lines: list[str]) -> set[int]:
    """Indices of the lines of one section file that sit inside an informative section.

    The heading itself is included, so a marker written on the heading line is caught too.
    """
    inside: set[int] = set()
    #: (level, informative) for each open ancestor, so the flag can be inherited and then
    #: dropped again when a sibling at the same level starts.
    stack: list[tuple[int, bool]] = []
    for number, line in enumerate(lines):
        heading = parse_heading(line)
        if heading:
            level, node_id, classes = heading
            while stack and stack[-1][0] >= level:
                stack.pop()
            informative = is_informative(node_id, classes, stack[-1][1] if stack else False)
            stack.append((level, informative))
        if stack and stack[-1][1]:
            inside.add(number)
    return inside
