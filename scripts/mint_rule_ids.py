#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Fill :rule[OOLD-XX-?] placeholders in the spec prose with freshly minted ids.

An author cannot pick the hex suffix by hand - it names nothing, so there is nothing to
choose - so a new rule starts life with a placeholder:

    :rule[OOLD-RT-?]{applies=document level=MUST summary="..."}...

and this script mints the missing suffix, rewriting the marker in place. Minting is
append-only: an id that already matches the current shape (`rule_ids.RULE_ID`) is never
touched, so running this again after some placeholders were minted and others were not is
safe.

`--migrate` additionally replaces every surviving `OOLD-XX-NNN` sequential id - the shape the
catalog used before this scheme. It is a one-off for that transition, not something a normal
contribution needs: routine use is just filling placeholders. Because a legacy id is cited in
more than the marker that defines it, `--migrate` follows the mapping everywhere it is cited
in one pass - the marker itself, any `superseded_by=...` that names it, the matching key in
meta/rules-baseline.json (hash carried across unchanged), and the "rule" fields in
examples/compliance/*.json - so nothing is left half-migrated.

Run with --dry-run first to review the mapping; --seed makes a run reproducible, which matters
most for reviewing a --migrate before it is committed.
"""

from __future__ import annotations

import argparse
import glob
import os
import random
import re
import secrets
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SECTIONS_DIR = os.path.join(ROOT, "spec", "sections")
COMPLIANCE_DIR = os.path.join(ROOT, "examples", "compliance")

sys.path.insert(0, HERE)
import rule_ids  # noqa: E402
import rules_baseline  # noqa: E402

#: Where a `superseded_by=...` attribute value cites another rule id, so a migrated id is
#: followed there too rather than only at the marker it names.
SUPERSEDED_BY = re.compile(r'superseded_by\s*=\s*(?:"[^"]*"|\S+)')
LEGACY_TOKEN = re.compile(r"OOLD-[A-Z]{2,3}-\d{3}")

#: A `"rule": "OOLD-XX-NNN"` value in a compliance fixture (examples/compliance/*.json).
COMPLIANCE_RULE = re.compile(r'("rule"\s*:\s*")([^"]*)(")')


def rel(path: str) -> str:
    return os.path.relpath(path, ROOT).replace(os.sep, "/")


def rewrite_superseded_by(attrs: str, legacy_map: dict[str, str]) -> str:
    """Follow the mapping inside `superseded_by=...`, the one place a marker cites another id."""
    if not legacy_map:
        return attrs

    def fix_value(match: re.Match) -> str:
        return LEGACY_TOKEN.sub(lambda token: legacy_map.get(token.group(0), token.group(0)), match.group(0))

    return SUPERSEDED_BY.sub(fix_value, attrs)


def scan(
    md_paths: list[str], texts: dict[str, str], migrate: bool, reserved: set[str], rng: random.Random
) -> tuple[list[str], list[tuple[str, str]], dict[str, str], dict[str, list[str]]]:
    """First pass: mint every id that needs one, and collect problems. Nothing is rewritten here.

    A problem found while scanning file 3 of 10 must not leave the first two half-migrated, so
    every mint happens before any write. Legacy ids are this pass's job only under --migrate;
    without it they are simply not this run's concern, same as any other id shape this tool
    does not recognise.
    """
    problems: list[str] = []
    mapping: list[tuple[str, str]] = []
    legacy_map: dict[str, str] = {}
    placeholder_ids: dict[str, list[str]] = {}

    for path in md_paths:
        ids_in_file: list[str] = []
        for match in rule_ids.MARKER.finditer(texts[path]):
            id_str = match.group(1)
            if rule_ids.RULE_ID.match(id_str):
                continue  # settled; minting is append-only and never touches this

            placeholder = rule_ids.PLACEHOLDER.match(id_str)
            if placeholder:
                try:
                    new_id = rule_ids.mint(reserved, placeholder.group(1), rng)
                except ValueError as exc:
                    problems.append(f"{rel(path)}: placeholder {id_str} - {exc}")
                    continue
                ids_in_file.append(new_id)
                mapping.append((id_str, new_id))
                continue

            if not migrate:
                continue  # a legacy id (or anything else unrecognised) is not this run's job

            legacy = rule_ids.LEGACY_ID.match(id_str)
            if legacy and id_str not in legacy_map:
                try:
                    legacy_map[id_str] = rule_ids.mint(reserved, legacy.group(1), rng)
                except ValueError as exc:
                    problems.append(f"{rel(path)}: {id_str} - {exc}")
                    continue
                mapping.append((id_str, legacy_map[id_str]))
        placeholder_ids[path] = ids_in_file

    return problems, mapping, legacy_map, placeholder_ids


def rewrite_markdown(
    text: str, path: str, migrate: bool, legacy_map: dict[str, str], placeholder_ids: dict[str, list[str]]
) -> str:
    """Apply the plan `scan()` already made. Only the id, and superseded_by=, ever change."""
    ids = iter(placeholder_ids[path])

    def replace(match: re.Match) -> str:
        id_str, attrs = match.group(1), match.group(2)
        if rule_ids.RULE_ID.match(id_str):
            new_id = id_str
        elif rule_ids.PLACEHOLDER.match(id_str):
            new_id = next(ids)
        elif migrate and rule_ids.LEGACY_ID.match(id_str):
            new_id = legacy_map[id_str]
        else:
            new_id = id_str
        new_attrs = rewrite_superseded_by(attrs, legacy_map)
        whole = match.group(0)
        # Everything after the attrs' closing "}" is the marker's optional trailing
        # whitespace ([ \t]* in rule_ids.MARKER); slice it from the original match so it
        # survives byte-identical regardless of how the id's length changed.
        trailing = whole[match.end(2) - match.start(0) + 1 :]
        return f":rule[{new_id}]{{{new_attrs}}}" + trailing

    return rule_ids.MARKER.sub(replace, text)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="mint_rule_ids.py",
        description="Fill :rule[OOLD-XX-?] placeholders in spec/sections/*.md with freshly minted ids.",
    )
    parser.add_argument(
        "--migrate",
        action="store_true",
        help=(
            "Also replace every surviving OOLD-XX-NNN sequential id with a freshly minted one, "
            "everywhere it is cited. One-off for the migration to the hex-suffix scheme; not "
            "needed for routine placeholder-filling afterwards."
        ),
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Seed the RNG so the run is reproducible (e.g. to review a --migrate before committing it).",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print the mapping; write nothing.")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    rng = random.Random(args.seed if args.seed is not None else secrets.randbits(64))
    reserved = rule_ids.reserved_ids(ROOT)
    problems: list[str] = []

    md_paths = sorted(glob.glob(os.path.join(SECTIONS_DIR, "*.md")))
    texts: dict[str, str] = {}
    for path in md_paths:
        try:
            with open(path, encoding="utf-8") as handle:
                texts[path] = handle.read()
        except OSError as exc:
            problems.append(f"{rel(path)}: cannot read ({exc})")

    # Only --migrate can touch these, so only --migrate needs them read and validated.
    baseline_loaded: tuple[dict[str, str], set[str]] | None = None
    compliance_paths: list[str] = []
    compliance_texts: dict[str, str] = {}
    if args.migrate:
        if os.path.exists(rules_baseline.BASELINE):
            try:
                baseline_loaded = rules_baseline.load_baseline()
            except (OSError, ValueError) as exc:
                problems.append(f"{rel(rules_baseline.BASELINE)}: cannot read ({exc})")
        compliance_paths = sorted(glob.glob(os.path.join(COMPLIANCE_DIR, "*.json")))
        for path in compliance_paths:
            try:
                with open(path, encoding="utf-8") as handle:
                    compliance_texts[path] = handle.read()
            except OSError as exc:
                problems.append(f"{rel(path)}: cannot read ({exc})")

    if problems:
        print("mint FAILED:", file=sys.stderr)
        for problem in problems:
            print("  - " + problem, file=sys.stderr)
        return 1

    scan_problems, mapping, legacy_map, placeholder_ids = scan(md_paths, texts, args.migrate, reserved, rng)
    if scan_problems:
        print("mint FAILED:", file=sys.stderr)
        for problem in scan_problems:
            print("  - " + problem, file=sys.stderr)
        return 1

    if not mapping:
        scope = "placeholders or legacy ids" if args.migrate else "placeholders"
        print(f"nothing to mint: no {scope} found in spec/sections/*.md")
        return 0

    for old, new in mapping:
        print(f"{old} -> {new}")
    print("")
    print(f"{len(mapping)} id(s) minted")

    if args.dry_run:
        return 0

    for path in md_paths:
        new_text = rewrite_markdown(texts[path], path, args.migrate, legacy_map, placeholder_ids)
        if new_text != texts[path]:
            with open(path, "w", encoding="utf-8", newline="\n") as handle:
                handle.write(new_text)

    if legacy_map and baseline_loaded is not None:
        accepted, deprecated = baseline_loaded
        new_accepted = {legacy_map.get(rid, rid): digest for rid, digest in accepted.items()}
        new_deprecated = {legacy_map.get(rid, rid) for rid in deprecated}
        if new_accepted != accepted or new_deprecated != deprecated:
            # write_baseline() is rules_baseline.py's own serialiser; reusing it (rather than
            # reimplementing the indent/sort/newline conventions here) is what keeps this
            # committed byte-for-byte with an ordinary `make rules-accept` run.
            rules_baseline.write_baseline(new_accepted, new_deprecated)

    if legacy_map:
        for path in compliance_paths:
            new_text = COMPLIANCE_RULE.sub(
                lambda m: m.group(1) + legacy_map.get(m.group(2), m.group(2)) + m.group(3),
                compliance_texts[path],
            )
            if new_text != compliance_texts[path]:
                with open(path, "w", encoding="utf-8", newline="\n") as handle:
                    handle.write(new_text)

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
