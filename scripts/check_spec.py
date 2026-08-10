#!/usr/bin/env python3
"""Structural lint for the generated ReSpec spec (docs/spec/index.html).

Catches broken cross-references, unknown term refs, and unresolved bibliography
refs that would otherwise only surface when ReSpec renders in a browser. Fast,
no browser required. Run after render_spec.py.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import spec_config as cfg  # noqa: E402

html = open(os.path.join(ROOT, "docs", "spec", "index.html"), encoding="utf-8").read()

# Every bibliography reference is defined in localBiblio (spec_config.py), so the
# References section is self-contained; a ref not found there is a typo or a
# missing entry. (Previously some keys were resolved from ReSpec's SpecRef
# database via a hand-maintained allow-list; that list is no longer needed.)
KNOWN_BIBLIO = set()

SECTIONS_DIR = os.path.join(ROOT, "spec", "sections")
# {#id} attribute on any ATX heading (only these become <section id="..."> ids).
HEADING_ID = re.compile(r'^\s*#{2,6}\s+.*\{[^}]*#([A-Za-z0-9_-]+)[^}]*\}\s*$', re.M)


def expected_ids():
    """Section ids the generated HTML must contain, derived from the source.

    Every {#id} on a heading in spec/sections/*.md, plus the ids that come from
    the config rather than a heading (headingless abstract/sotd, and the
    generated terminology/index sections). Parsing the source instead of a
    hand-maintained list means new anchors need no bookkeeping here.
    """
    ids = set()
    for entry in cfg.SECTIONS:
        if entry.get("file"):
            src = open(os.path.join(SECTIONS_DIR, entry["file"]), encoding="utf-8").read()
            ids.update(HEADING_ID.findall(src))
            if entry.get("headingless") and entry.get("id"):
                ids.add(entry["id"])
        elif entry.get("generate"):
            ids.add(entry["generate"])  # "terminology" / "index"
    return ids


EXPECTED_IDS = sorted(expected_ids())

errors = []

# 1. Every internal href="#id" resolves to an existing id.
ids = set(re.findall(r'\sid="([^"]+)"', html))
for target in re.findall(r'href="#([^"]+)"', html):
    if target not in ids:
        errors.append(f"broken cross-reference: #{target}")

# 2. Every [=term=] reference matches a defined data-lt alias.
aliases = set()
for lt in re.findall(r'data-lt="([^"]+)"', html):
    aliases.update(a.strip().lower() for a in lt.split("|"))
for ref in re.findall(r"\[=([^\]]+)=\]", html):
    if ref.split("|")[0].strip().lower() not in aliases:
        errors.append(f"undefined term reference: [={ref}=]")

# 3. Every [[REF]] is in localBiblio or a known ReSpec key.
local_biblio = set(cfg.RESPEC.get("localBiblio", {}))
for key in re.findall(r"\[\[!?([A-Za-z0-9-]+)\]\]", html):
    if key not in local_biblio and key not in KNOWN_BIBLIO:
        errors.append(f"unknown bibliography reference: [[{key}]] (add to localBiblio or KNOWN_BIBLIO)")

# 4. Section-id set matches the expected list (guards accidental renames that
#    would break external deep links).
section_ids = sorted(re.findall(r'<section id="([^"]+)"', html))
missing = [i for i in EXPECTED_IDS if i not in section_ids]
extra = [i for i in section_ids if i not in EXPECTED_IDS]
if missing:
    errors.append("missing expected section ids: " + ", ".join(missing))
if extra:
    errors.append("unexpected section ids: " + ", ".join(extra) + " (no matching {#id} in spec/sections/*.md or config)")

# 5. Rule catalog: every :rule[...] anchor is present in the rendered HTML, and the catalog is
#    append-only with respect to the last release. A rule id is cited in reviews and reports, so
#    renaming or dropping one silently breaks references that already exist in the wild.
RULES_FILE = os.path.join(ROOT, "meta", "oold-rules.json")
rules = []
if os.path.exists(RULES_FILE):
    with open(RULES_FILE, encoding="utf-8") as handle:
        rules = json.load(handle).get("rules", [])

#: The anchor has to sit on the marked sentence itself - a <span class="rule" id="...">
#: emitted by render_spec.py - so that following a cited link lands on the requirement and
#: `:target` can highlight it. class="rule" and id="..." can appear in either order on the
#: tag, so both are required to be present rather than adjacent.
def rule_span_pattern(rule_id):
    escaped = re.escape(rule_id)
    return re.compile(rf'<span\b(?=[^>]*\bclass="rule")(?=[^>]*\bid="{escaped}")[^>]*>')


for rule in rules:
    if rule_span_pattern(rule["id"]).search(html):
        continue
    if f'id="{rule["id"]}"' in html:
        errors.append(
            f"rule {rule['id']} is anchored on an element that is not a rule span "
            '(<span class="rule" id="...">), so the deep link will not land on the '
            "requirement and :target will not highlight it. Check render_spec.py's rule-marking pass"
        )
    else:
        errors.append(f"rule {rule['id']} has no anchor in the rendered spec (stale docs/spec/index.html?)")


def released_rules():
    """The catalog as of the most recent release tag, or None before one shipped it.

    Comparing against the *tag* rather than the working tree is deliberate: ids may still be
    reshuffled freely until a release ships a catalog, and within a cycle several commits may add
    rules without tripping over each other.
    """
    try:
        tag = subprocess.check_output(  # noqa: S603,S607 - fixed argv, repo-local
            ["git", "describe", "--tags", "--abbrev=0"], cwd=ROOT, stderr=subprocess.DEVNULL, text=True
        ).strip()
        blob = subprocess.check_output(  # noqa: S603,S607
            ["git", "show", f"{tag}:meta/oold-rules.json"], cwd=ROOT, stderr=subprocess.DEVNULL, text=True
        )
    except Exception:
        return None, None
    return tag, {r["id"]: r for r in json.loads(blob).get("rules", [])}


released_tag, released = released_rules()
if released:
    current = {r["id"]: r for r in rules}
    for rule_id, before in released.items():
        now = current.get(rule_id)
        if now is None:
            errors.append(
                f"rule {rule_id} was released in {released_tag} but is gone. Ids are permanent: "
                "deprecate it (deprecated=yes) instead of deleting it."
            )
            continue
        for field in ("area", "level", "applies_to"):
            if now[field] != before[field]:
                errors.append(
                    f"rule {rule_id} changed {field} from {before[field]!r} to {now[field]!r} "
                    f"since {released_tag}. Mint a new id and deprecate this one instead."
                )
        if before.get("deprecated") and not now.get("deprecated"):
            errors.append(f"rule {rule_id} was deprecated in {released_tag} and must stay deprecated")

if errors:
    print("spec check FAILED:", file=sys.stderr)
    for e in errors:
        print("  - " + e, file=sys.stderr)
    sys.exit(1)
rule_note = f", {len(rules)} rules" if rules else ""
if rules and not released:
    rule_note += " (no released catalog to compare against yet)"
print(f"spec check OK ({len(section_ids)} sections, {len(aliases)} term aliases{rule_note})")
