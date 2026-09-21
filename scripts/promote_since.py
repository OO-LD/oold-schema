#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Resolve `since: unreleased` in the rule catalogue to the release being tagged.

A rule is authored before the release that carries it exists, so `extract_rules.py` records
`unreleased` and this script fills in the number. Run it as part of cutting a release, before
the tag:

    uv run scripts/promote_since.py 1.0.0-rc.4
    make spec        # re-render so docs/rules.md carries the resolved value
    git commit && git tag

Only `unreleased` entries are touched. Every other `since` is a historical record of a release
that has already shipped, and rewriting one would turn the field into "whenever the generator
last ran", which is what it exists to avoid.
"""

from __future__ import annotations

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "meta", "oold-rules.json")

#: Accepts a bare semantic version with an optional pre-release suffix, with or without the tag's
#: `v`. The catalogue stores the bare form, so a leading `v` is stripped rather than rejected.
VERSION = re.compile(r"^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$")


def main(argv: list[str]) -> int:
    if len(argv) != 2 or not VERSION.match(argv[1]):
        print("usage: promote_since.py <version>    e.g. 1.0.0-rc.4", file=sys.stderr)
        return 2

    version = argv[1].lstrip("v")

    with open(CATALOG, encoding="utf-8") as handle:
        catalog = json.load(handle)

    promoted = [rule["id"] for rule in catalog["rules"] if rule.get("since") == "unreleased"]
    if not promoted:
        print("no rules are marked unreleased; nothing to promote")
        return 0

    for rule in catalog["rules"]:
        if rule.get("since") == "unreleased":
            rule["since"] = version

    with open(CATALOG, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(catalog, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(f"promoted {len(promoted)} rule(s) to since={version}:")
    for rule_id in sorted(promoted):
        print(f"  {rule_id}")
    print("\nRun `make spec` so docs/rules.md matches, then commit before tagging.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
