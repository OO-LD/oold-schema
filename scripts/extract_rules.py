#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Generate meta/oold-rules.json from the :rule[...] markers in spec/sections/*.md.

The specification prose is the single source of truth. A normative statement is marked with an
authored, immutable identifier::

    :rule[OOLD-RT-08f2]{applies=document}Because the reconstruction MUST re-validate, a property
    that is *strictly* an array MUST declare `@container`.

and this script turns every such marker into a catalog record. `text` is extracted verbatim, never
hand-copied, so the catalog cannot drift from the specification it describes.

Ids are read, never assigned. Numbering by document position would renumber every following rule
the first time someone inserts a paragraph, which is precisely what a stable code must never do.
See meta/RULES.md for the lifecycle policy.

Run from `make spec`; `scripts/check_spec.py` enforces the registry guarantees afterwards.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SECTIONS_DIR = os.path.join(ROOT, "spec", "sections")
OUT = os.path.join(ROOT, "meta", "oold-rules.json")

sys.path.insert(0, HERE)
import spec_config as cfg  # noqa: E402
from rule_ids import AREAS, LEGACY_ID, PLACEHOLDER  # noqa: E402
from rule_ids import MARKER as RULE  # noqa: E402
from rule_ids import RULE_ID  # noqa: E402

#: Who a requirement binds. This decides what is able to enforce it: `document` rules are
#: checkable by validating a schema or instance, `implementation` rules constrain a library and
#: need a conformance suite, `advisory` ones are guidance that nothing verifies.
APPLIES = ("document", "implementation", "advisory")

HEADING = re.compile(r"^\s*#{2,6}\s+.*\{[^}]*#([A-Za-z0-9_-]+)[^}]*\}\s*$")
ATTR = re.compile(r'(\w+)\s*=\s*(?:"([^"]*)"|(\S+))')
RFC2119 = re.compile(r"\b(MUST NOT|MUST|SHALL NOT|SHALL|SHOULD NOT|SHOULD|REQUIRED|RECOMMENDED)\b")

LIST_ITEM = re.compile(r"^\s*(?:[-*+]|\d+\.)\s")

#: Strip markup that would make `text` noisy to read in a terminal.
CLEAN = [
    (re.compile(r"\{\{[^}]*\}\}"), ""),          # Jinja macro calls
    (re.compile(r":dfn\[([^\]]*)\]\{[^}]*\}"), r"\1"),
    (re.compile(r"\[\[!?([A-Za-z0-9-]+)\]\]"), r"\1"),
    (re.compile(r"\[=([^\]|=]+)(?:\|[^\]=]*)?=\]"), r"\1"),
    (re.compile(r"\*\*([^*]+)\*\*"), r"\1"),
    (re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)"), r"\1"),
    (re.compile(r"\s+"), " "),
]


def spec_version() -> str:
    """The release a *newly minted* rule belongs to: the most recent tag.

    Same source as the ReSpec subtitle (`render_spec.py:_git_version`), so `since` records a real
    release rather than a hand-maintained constant. This value applies only to ids the catalogue
    has not seen before; see :func:`recorded_since`.
    """
    try:
        out = subprocess.check_output(  # noqa: S603,S607 - fixed argv, repo-local
            ["git", "describe", "--tags", "--abbrev=0"], cwd=ROOT, stderr=subprocess.DEVNULL, text=True
        ).strip()
        return out.lstrip("v") or "draft"
    except Exception:
        return "draft"


def recorded_since() -> dict[str, str]:
    """`since` as the committed catalogue already records it, keyed by rule id.

    `since` means "the release this rule first appeared in", so it must survive regeneration. It
    is not derivable from the prose, which says nothing about when a sentence was written, and it
    cannot be taken from the current tag either: doing so rewrote the field for *every* rule on
    any run made after a new tag, silently turning a historical record into "whenever the
    generator last ran". Carrying the existing value forward is what makes it a record at all.

    A rule absent here is genuinely new and takes :func:`spec_version`. If the catalogue is
    missing or unreadable every rule looks new, which the CI drift check catches as a whole-file
    diff rather than letting it pass quietly.
    """
    try:
        with open(OUT, encoding="utf-8") as handle:
            return {r["id"]: r["since"] for r in json.load(handle)["rules"] if r.get("since")}
    except (OSError, ValueError, KeyError):
        return {}


def parse_attrs(raw: str) -> dict[str, str]:
    return {m.group(1): (m.group(2) if m.group(2) is not None else m.group(3)) for m in ATTR.finditer(raw)}


def clean_text(text: str) -> str:
    text = LIST_ITEM.sub("", text, count=1)  # drop the bullet marker of an item-level rule
    for pattern, repl in CLEAN:
        text = pattern.sub(repl, text)
    return text.strip()


def paragraph_bounds(lines: list[str], index: int) -> tuple[int, int]:
    """The prose block containing line `index`.

    Block granularity is deliberate: it is unambiguous to extract, whereas splitting prose into
    sentences breaks on abbreviations and on periods inside code spans.

    A list item is its own block. Several of the round-trip requirements are bullets in one list,
    and treating the list as a single paragraph would give every one of them the same `text`
    covering all the others.
    """
    if LIST_ITEM.match(lines[index]):
        end = index
        while end + 1 < len(lines) and lines[end + 1].strip() and not LIST_ITEM.match(lines[end + 1]):
            end += 1
        return index, end

    start = index
    while start > 0 and lines[start - 1].strip() and not LIST_ITEM.match(lines[start - 1]):
        start -= 1
    if start > 0 and LIST_ITEM.match(lines[start - 1]):
        start -= 1  # a continuation line belongs to its item
    end = index
    while end + 1 < len(lines) and lines[end + 1].strip() and not LIST_ITEM.match(lines[end + 1]):
        end += 1
    return start, end


def non_normative_blocks(lines: list[str]) -> set[int]:
    """Line numbers inside a `:::note` or `:::example` container.

    The conformance section states that notes and examples are non-normative, so a `:rule[...]`
    marker inside one is a contradiction: either the statement is not really a requirement, or it
    is a requirement sitting where the specification says requirements do not live. Both are worth
    failing on rather than quietly cataloguing.
    """
    inside: set[int] = set()
    depth = 0
    for number, line in enumerate(lines):
        opening = re.match(r"^:::(example|note)\{", line)
        if opening:
            depth += 1
            continue
        if line.strip() == ":::" and depth:
            depth -= 1
            continue
        if depth:
            inside.add(number)
    return inside


def extract_file(filename: str, problems: list[str]) -> list[dict]:
    path = os.path.join(SECTIONS_DIR, filename)
    with open(path, encoding="utf-8") as handle:
        lines = handle.read().split("\n")

    rules: list[dict] = []
    section = None
    informative = non_normative_blocks(lines)
    for number, line in enumerate(lines):
        heading = HEADING.match(line)
        if heading:
            section = heading.group(1)
        for match in RULE.finditer(line):
            rule_id, attrs = match.group(1), parse_attrs(match.group(2))
            where = f"{filename}:{number + 1}"

            if number in informative and attrs.get("in_note", "no").lower() not in ("yes", "true", "1"):
                problems.append(
                    f"{where}: {rule_id} is inside a :::note/:::example block, which the "
                    "conformance section declares non-normative. Move the requirement into "
                    "normative prose, or set in_note=yes if the placement is deliberate."
                )
                continue

            shape = RULE_ID.match(rule_id)
            if not shape:
                if PLACEHOLDER.match(rule_id):
                    problems.append(f"{where}: {rule_id} is still a placeholder. Fix: run `make rules-mint`")
                elif LEGACY_ID.match(rule_id):
                    problems.append(
                        f"{where}: {rule_id} uses the retired sequential shape. "
                        "Fix: run `uv run scripts/mint_rule_ids.py --migrate`"
                    )
                else:
                    problems.append(f"{where}: {rule_id!r} is not of the form OOLD-<AREA>-<4 hex chars>")
                continue
            area = shape.group(1)
            if area not in AREAS:
                problems.append(f"{where}: {rule_id} uses unknown area {area!r} (known: {', '.join(AREAS)})")
                continue

            applies = attrs.get("applies", "document")
            if applies not in APPLIES:
                problems.append(f"{where}: {rule_id} has applies={applies!r}, expected one of {', '.join(APPLIES)}")
                continue

            start, end = paragraph_bounds(lines, number)
            paragraph = "\n".join(lines[start : end + 1])
            text = clean_text(RULE.sub("", paragraph))

            # `level` is normally the first RFC 2119 keyword after the marker. A paragraph that
            # chains several requirements needs `level=` so the id names the intended one rather
            # than whichever keyword happens to come first; such paragraphs are candidates for an
            # editorial split into separate statements.
            level = attrs.get("level")
            if level:
                if not RFC2119.fullmatch(level):
                    problems.append(f"{where}: {rule_id} has level={level!r}, which is not an RFC 2119 keyword")
                    continue
            else:
                level_match = RFC2119.search(RULE.sub("", line)) or RFC2119.search(paragraph)
                if not level_match:
                    problems.append(f"{where}: {rule_id} marks a paragraph with no RFC 2119 keyword")
                    continue
                level = level_match.group(1)
            if level not in paragraph:
                problems.append(f"{where}: {rule_id} declares level={level!r}, absent from the marked prose")
                continue

            # `checkable` defaults to true only for document rules: an implementation rule needs a
            # library conformance suite and advisory text needs nothing at all.
            default_checkable = "yes" if applies == "document" else "no"
            checkable = attrs.get("checkable", default_checkable).lower() in ("yes", "true", "1")

            record = {
                "id": rule_id,
                "area": area,
                "level": level,
                "applies_to": applies,
                "section": section,
                "summary": attrs.get("summary") or first_sentence(text),
                "text": text,
                "text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "checkable": checkable,
                # Authored value wins; otherwise keep what the catalogue already recorded, and
                # only fall back to the current tag for an id nobody has seen before.
                "since": attrs.get("since") or SINCE.get(rule_id, VERSION),
                "deprecated": attrs.get("deprecated", "no").lower() in ("yes", "true", "1"),
                "source": where,
            }
            if attrs.get("superseded_by"):
                record["superseded_by"] = [s.strip() for s in attrs["superseded_by"].split(",")]
            rules.append(record)
    return rules


def first_sentence(text: str, limit: int = 160) -> str:
    """Fallback summary: the opening sentence, so `summary=` is optional when the prose is clear."""
    match = re.search(r"(?<=[a-z0-9)`\"])\.(?:\s|$)", text)
    sentence = text[: match.start() + 1] if match else text
    return sentence if len(sentence) <= limit else sentence[: limit - 1].rstrip() + "…"


def main() -> int:
    global VERSION, SINCE
    VERSION = spec_version()
    SINCE = recorded_since()
    problems: list[str] = []
    rules: list[dict] = []
    for entry in cfg.SECTIONS:
        if entry.get("file"):
            rules.extend(extract_file(entry["file"], problems))

    seen: dict[str, str] = {}
    for rule in rules:
        if rule["id"] in seen:
            problems.append(f"{rule['source']}: duplicate rule id {rule['id']} (also at {seen[rule['id']]})")
        seen[rule["id"]] = rule["source"]

    # The suffix has to be unique on its own, not merely in combination with an area, since that
    # is what lets a bare suffix identify a rule. `mint()` will not issue a colliding one, but an
    # id can also arrive by hand or through a bad merge, so the catalogue asserts it rather than
    # trusting the tool that usually produces it.
    by_suffix: dict[str, str] = {}
    for rule in rules:
        suffix = rule["id"].rsplit("-", 1)[1]
        if suffix in by_suffix:
            problems.append(
                f"{rule['source']}: {rule['id']} reuses the suffix {suffix!r}, already taken by "
                f"{by_suffix[suffix]}. Suffixes are unique across the whole catalogue"
            )
        by_suffix[suffix] = rule["id"]

    if problems:
        print("rule extraction FAILED:", file=sys.stderr)
        for problem in problems:
            print("  - " + problem, file=sys.stderr)
        return 1

    rules.sort(key=lambda r: (r["area"], r["id"]))
    payload = {
        # The catalogue is data other tools read to decide what the specification requires, so it
        # names the schema that describes it. Released copies stamp their version in place of
        # `latest`, the same convention the meta-schemas follow.
        "$schema": "https://oo-ld.org/latest/meta/oold-rules.schema.json",
        "$comment": (
            "Catalog of the normative statements in the OO-LD specification, generated from the "
            ":rule[...] markers in spec/sections/*.md by scripts/extract_rules.py. Do not edit by "
            "hand. Ids are immutable and never reused; see meta/RULES.md."
        ),
        "spec_version": VERSION,
        "areas": AREAS,
        "applies_to": {
            "document": "Checkable by validating a schema or instance document",
            "implementation": "Constrains an OO-LD implementation; needs a library conformance suite",
            "advisory": "Guidance; nothing verifies it automatically",
        },
        "rules": rules,
    }
    # newline="\n": the catalogue is committed and its bytes are checksummed downstream, so it
    # must not depend on the platform that generated it.
    with open(OUT, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    checkable = sum(1 for r in rules if r["checkable"])
    print(f"rules extracted: {len(rules)} ({checkable} checkable) -> meta/oold-rules.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
