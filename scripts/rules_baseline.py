#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Guard the rule catalogue against silent loss and unreviewed rewording.

`meta/oold-rules.json` is generated from the prose, so it always reflects the spec as it is now.
`meta/rules-baseline.json` records the state a human last *accepted*. Comparing the two turns
two otherwise invisible events into a stop:

* a rule id disappears - a marker deleted, or dropped by a clean-side rewrite during a rebase,
  which is exactly how OOLD-EXT-436a was lost once already;
* a rule's text changes - which may be a typo fix or may be a different requirement wearing the
  same id, and no checker can tell those apart.

A *new* id needs no ceremony: it cannot be a disguised meaning-change, so it is recorded
automatically. Accepting a changed rule is deliberate and per-id::

    make rules-accept IDS="OOLD-RT-08f2"

Accept-all is intentionally not offered. One keystroke that blesses every difference would wave
through an accidental meaning-change alongside a typo, which is the whole thing this guards.

Usage:
    rules_baseline.py check
    rules_baseline.py accept OOLD-RT-08f2 [OOLD-EXT-6ea3 ...]
"""

from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CATALOG = os.path.join(ROOT, "meta", "oold-rules.json")
BASELINE = os.path.join(ROOT, "meta", "rules-baseline.json")

sys.path.insert(0, HERE)
from rule_ids import RULE_ID  # noqa: E402

COMMENT = (
    "Rule text last accepted by a human, keyed by rule id. Generated? No - updated only by "
    "`make rules-accept IDS=...`, which is the recorded act of deciding that a changed rule was "
    "reworded rather than redefined. See meta/RULES.md."
)

#: Where a downstream implementer learns how to turn a rule into a check. Printed whenever the
#: catalogue gains or retires a rule, because that is the moment the work becomes visible and the
#: moment it is cheapest to record.
TRANSLATION_GUIDE = (
    "https://github.com/OO-LD/oold-python/blob/main/CONTRIBUTING.md#translating-a-specification-rule"
)

#: What each kind of rule implies for the Python validator.
DOWNSTREAM = {
    ("document", True): "needs a check in oold-python before the validator can enforce it",
    ("document", False): "binds documents but is not mechanically decidable; no check expected",
    ("implementation", True): "needs a library conformance test; a validator cannot see it",
    ("implementation", False): "needs a library conformance test; a validator cannot see it",
    ("advisory", True): "guidance only; nothing to implement",
    ("advisory", False): "guidance only; nothing to implement",
}


def load_catalog() -> dict[str, dict]:
    with open(CATALOG, encoding="utf-8") as handle:
        return {r["id"]: r for r in json.load(handle)["rules"]}


def load_baseline() -> tuple[dict[str, str], set[str]] | None:
    """Accepted hashes by id, plus the ids already known to be deprecated."""
    if not os.path.exists(BASELINE):
        return None
    with open(BASELINE, encoding="utf-8") as handle:
        raw = json.load(handle)
    accepted = {k: v for k, v in raw.items() if not k.startswith("$")}
    return accepted, set(raw.get("$deprecated", []))


def write_baseline(accepted: dict[str, str], deprecated: set[str]) -> None:
    payload: dict = {"$comment": COMMENT}
    if deprecated:
        # A list rather than a flag per rule: retirement is rare, and one extra line keeps the
        # per-rule diffs to a single line each.
        payload["$deprecated"] = sorted(deprecated)
    payload.update({k: accepted[k] for k in sorted(accepted)})
    # newline="\n" so the committed baseline is byte-identical on every platform.
    with open(BASELINE, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")


def short(digest: str) -> str:
    return digest[:12] + "..."


def describe_changed(rule: dict, was: str) -> list[str]:
    """The two things that could have happened, and the exact command for each."""
    rid = rule["id"]
    area = RULE_ID.match(rid).group(1)
    return [
        f"  {rid}  text changed since it was last accepted",
        f"      section   #{rule.get('section')}   ({rule.get('source')})",
        f"      accepted  {short(was)}",
        f"      now       {short(rule['text_sha256'])}",
        "",
        "      Decide which of these happened:",
        "",
        "      (a) The wording changed but the requirement did not - a typo, a clarification,",
        "          a reference added. The id stays. Record that you checked:",
        f"              make rules-accept IDS=\"{rid}\"",
        "",
        "      (b) The requirement itself changed, so it is a different rule now. Ids are",
        "          permanent and never reused, so retire this one and mint a replacement.",
        "          Mint before deprecating: the replacement's id is what the old rule has to",
        "          point at, and only the mint knows it. Add the new requirement beside the",
        "          old one with a placeholder id:",
        f'              :rule[OOLD-{area}-?]{{applies=document level="MUST" summary="..."}}',
        "          then mint it, which prints the id it chose:",
        "              make rules-mint",
        "          mark the old rule deprecated, naming that id:",
        f'              :rule[{rid}]{{... deprecated=yes superseded_by=<the minted id>}}',
        "          then regenerate and accept both:",
        "              make spec",
        f"              make rules-accept IDS=\"{rid} <the minted id>\"",
    ]


def describe_missing(rid: str, was: str) -> list[str]:
    return [
        f"  {rid}  in the baseline but absent from the catalogue",
        f"      accepted  {short(was)}",
        "",
        "      Its :rule[...] marker is no longer in the prose. This is usually accidental:",
        "      a rebase or a rewrite can take the sentence and drop the marker with it,",
        "      without any conflict.",
        "",
        "      (a) If the requirement still exists, put the marker back on it.",
        "",
        "      (b) If the requirement was removed on purpose, do not delete the id - keep the",
        "          marker and retire it, so anyone holding a report that cites it can still",
        "          resolve it:",
        f'              :rule[{rid}]{{... deprecated=yes}}',
        f"          then: make spec && make rules-accept IDS=\"{rid}\"",
    ]


def describe_new(rule: dict) -> list[str]:
    """A new rule, and what it implies for the Python validator."""
    kind = (rule.get("applies_to"), bool(rule.get("checkable")))
    scope = f"{rule.get('applies_to')}" + (", checkable" if rule.get("checkable") else "")
    return [
        f"    {rule['id']}  {rule.get('level')}  ({scope})",
        f"        {rule.get('summary')}",
        f"        #{rule.get('section')}   ({rule.get('source')})",
        f"        -> {DOWNSTREAM.get(kind, 'no downstream action recorded')}",
    ]


def describe_retired(rule: dict) -> list[str]:
    return [
        f"    {rule['id']}  now deprecated"
        + (f", superseded by {', '.join(rule['superseded_by'])}" if rule.get("superseded_by") else ""),
        f"        {rule.get('summary')}",
        "        -> oold-python should stop enforcing it for this version onward;",
        "           its check will skip once the new catalogue is vendored",
    ]


def report_downstream(new: list[dict], retired: list[dict]) -> None:
    """Announce catalogue changes that create work in the Python validator.

    Recorded automatically rather than blocking: a new id cannot be a renamed rule, and a
    retirement is a deliberate act already. But neither should pass in silence, because both
    mean the downstream implementation is now behind the specification, and this is the moment
    that is cheapest to notice.
    """
    if not new and not retired:
        return
    print("")
    if new:
        print(f"  {len(new)} new rule(s) recorded:")
        print("")
        for rule in new:
            for line in describe_new(rule):
                print(line)
            print("")
    if retired:
        print(f"  {len(retired)} rule(s) newly deprecated:")
        print("")
        for rule in retired:
            for line in describe_retired(rule):
                print(line)
            print("")
    print(f"  How to turn a rule into a check: {TRANSLATION_GUIDE}")
    print("  The standing gap is reported by `oold rules list --unchecked` in oold-python.")


def check() -> int:
    catalog = load_catalog()
    loaded = load_baseline()

    if loaded is None:
        write_baseline(
            {rid: r["text_sha256"] for rid, r in catalog.items()},
            {rid for rid, r in catalog.items() if r.get("deprecated")},
        )
        print(f"rule baseline created with {len(catalog)} rule(s) -> meta/rules-baseline.json")
        print("  (first run: the current catalogue is taken as accepted)")
        return 0

    baseline, was_deprecated = loaded
    changed = [
        (rid, baseline[rid]) for rid, r in catalog.items()
        if rid in baseline and r["text_sha256"] != baseline[rid]
    ]
    missing = [(rid, digest) for rid, digest in baseline.items() if rid not in catalog]
    added = [catalog[rid] for rid in catalog if rid not in baseline]
    now_deprecated = {rid for rid, r in catalog.items() if r.get("deprecated")}
    retired = [catalog[rid] for rid in sorted(now_deprecated - was_deprecated) if rid in baseline]
    revived = sorted(was_deprecated - now_deprecated)

    if changed or missing or revived:
        print("rule baseline check FAILED", file=sys.stderr)
        print("", file=sys.stderr)
        for rid, was in changed:
            for line in describe_changed(catalog[rid], was):
                print(line, file=sys.stderr)
            print("", file=sys.stderr)
        for rid, was in missing:
            for line in describe_missing(rid, was):
                print(line, file=sys.stderr)
            print("", file=sys.stderr)
        for rid in revived:
            print(f"  {rid}  was deprecated and is not any more", file=sys.stderr)
            print("      A retired id stays retired: reports already cite it. Mint a new id for", file=sys.stderr)
            print("      the reinstated requirement instead.", file=sys.stderr)
            print("", file=sys.stderr)
        parts = [f"{len(changed)} changed"] if changed else []
        parts += [f"{len(missing)} missing"] if missing else []
        parts += [f"{len(revived)} un-deprecated"] if revived else []
        print(f"  {', '.join(parts)}. Nothing was accepted; the baseline is unchanged.", file=sys.stderr)
        return 1

    if added or retired:
        write_baseline({rid: r["text_sha256"] for rid, r in catalog.items()}, now_deprecated)
    print(f"rule baseline OK ({len(catalog)} rules, all matching the accepted text)")
    report_downstream(added, retired)
    return 0


def accept(ids: list[str]) -> int:
    catalog = load_catalog()
    loaded = load_baseline()
    baseline, was_deprecated = loaded if loaded else ({}, set())
    wanted = [rid.upper() for rid in ids]

    problems = []
    for rid in wanted:
        if rid not in catalog:
            problems.append(f"  {rid} is not in the catalogue (run `make spec` first, or check the id)")
        elif baseline.get(rid) == catalog[rid]["text_sha256"]:
            problems.append(f"  {rid} is already accepted - nothing changed about it")
    if problems:
        print("cannot accept:", file=sys.stderr)
        for problem in problems:
            print(problem, file=sys.stderr)
        return 1

    for rid in wanted:
        was = baseline.get(rid)
        baseline[rid] = catalog[rid]["text_sha256"]
        print(f"  {'recorded' if was is None else 're-accepted'} {rid}  {short(baseline[rid])}")

    # Carry every other current rule forward, so the baseline stays a complete picture.
    for rid, rule in catalog.items():
        baseline.setdefault(rid, rule["text_sha256"])
    write_baseline(baseline, {rid for rid, r in catalog.items() if r.get("deprecated")})
    print("")
    print(f"meta/rules-baseline.json updated ({len(wanted)} accepted). Stage it with the spec change.")
    return 0


def main(argv: list[str]) -> int:
    if len(argv) >= 2 and argv[1] == "check":
        return check()
    if len(argv) >= 3 and argv[1] == "accept":
        return accept(argv[2:])
    print(__doc__.strip().split("Usage:")[-1].strip(), file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
