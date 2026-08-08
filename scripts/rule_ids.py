#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""The shape of a rule id, and how a fresh one is minted.

A rule id is `OOLD-<AREA>-<4 hex chars>`, e.g. `OOLD-RT-7f3a`. The suffix is minted, never
authored: a sequential number implies an order the catalogue does not have, and the first
deprecation leaves a visible hole (`OOLD-RT-002` next to `OOLD-RT-004` reads as a missing
rule, not a retired one). A meaningless suffix has neither problem.

Shared by scripts/extract_rules.py, scripts/rules_baseline.py, scripts/render_spec.py and
scripts/mint_rule_ids.py, so the pattern - and the areas it can name - are defined exactly
once. See meta/RULES.md for the lifecycle policy.
"""

from __future__ import annotations

import glob
import json
import os
import random
import re

#: The current shape. The suffix is minted, never chosen: it carries no ordering, so a
#: deprecated rule leaves no visible gap.
RULE_ID = re.compile(r"^OOLD-([A-Z]{2,3})-([0-9a-f]{4})$")

#: What an author writes before running `make rules-mint`.
PLACEHOLDER = re.compile(r"^OOLD-([A-Z]{2,3})-\?$")

#: The pre-hex shape, kept only so the one-off migration can recognise it. Nothing else
#: should accept an id of this form.
LEGACY_ID = re.compile(r"^OOLD-([A-Z]{2,3})-(\d{3})$")

#: The inline marker as it appears in spec/sections/*.md. `?` is allowed so an unminted
#: placeholder parses and can be reported with a useful message instead of "malformed id".
MARKER = re.compile(r":rule\[([A-Za-z0-9?-]+)\]\{([^}]*)\}[ \t]*")

#: Area prefixes, and what each covers. A rule's area is frozen when the id is minted: if the
#: prose later moves to another section the id does not change, only `section` does.
AREAS = {
    "CNF": "Serialization and conformance",
    "SCH": "Schema well-formedness and the meta-schema",
    "CMP": "Composition, merge and override",
    "INS": "Instances: $schema, identity, semantic type, value forms",
    "RT": "Projection to RDF and round-trip safety",
    "VER": "Identification and versioning",
    "EXT": "Standard extensions (JSON-LD and JSON Schema)",
}


def suffixes(ids: set[str]) -> set[str]:
    """The bare 4-character part of every well-formed id in `ids`."""
    return {match.group(2) for rule_id in ids if (match := RULE_ID.match(rule_id))}


def mint(reserved: set[str], area: str, rng: random.Random) -> str:
    """A free id in `area`, added to `reserved` so one run cannot mint a duplicate.

    The *suffix* is what has to be unique, catalogue-wide rather than per area, because that is
    what lets the bare suffix identify a rule on its own. Comparing whole ids instead would let
    OOLD-CMP-1120 and OOLD-CNF-1120 coexist and quietly break that promise.
    """
    if area not in AREAS:
        raise ValueError(f"unknown area {area!r} (known: {', '.join(AREAS)})")
    taken = suffixes(reserved)
    space = 16**4
    for _ in range(space):
        suffix = f"{rng.randrange(space):04x}"
        if suffix not in taken:
            candidate = f"OOLD-{area}-{suffix}"
            reserved.add(candidate)
            return candidate
    # Theoretical: 65536 suffixes against the tens of rules a specification actually has.
    # Raising rather than looping forever is what a genuinely exhausted space deserves.
    raise RuntimeError(f"cannot mint in {area!r}: all {space} suffixes are already taken")


def reserved_ids(root: str) -> set[str]:
    """Every id that must never be minted again.

    The union of the current catalogue (including deprecated rules, whose ids are permanent),
    the accepted baseline, and the markers currently in the prose. A retired id must never
    come back under a new meaning.

    All three sources are optional: a missing or unparseable file contributes nothing rather
    than raising, so this can run before the catalogue has ever been generated.
    """
    ids: set[str] = set()

    try:
        with open(os.path.join(root, "meta", "oold-rules.json"), encoding="utf-8") as handle:
            catalog = json.load(handle)
        ids.update(rule["id"] for rule in catalog.get("rules", []) if rule.get("id"))
    except (OSError, ValueError, KeyError):
        pass

    try:
        with open(os.path.join(root, "meta", "rules-baseline.json"), encoding="utf-8") as handle:
            baseline = json.load(handle)
        ids.update(key for key in baseline if not key.startswith("$"))
    except (OSError, ValueError):
        pass

    try:
        for path in glob.glob(os.path.join(root, "spec", "sections", "*.md")):
            with open(path, encoding="utf-8") as handle:
                text = handle.read()
            ids.update(match.group(1) for match in MARKER.finditer(text))
    except OSError:
        pass

    return ids
