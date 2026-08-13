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
from rule_scope import sentence_end  # noqa: E402

#: Who a requirement binds. This decides what is able to enforce it: `document` rules are
#: machine-checkable by validating a schema or instance, `implementation` rules constrain a
#: library and need a conformance suite, `advisory` ones are guidance that nothing verifies.
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

    This feeds `context`: the surrounding prose a rule's sentence was stated in, kept for
    display. It is not what gets hashed - see rule_scope.sentence_end for the narrower `text`,
    and for why sentence-level extraction is safe despite the hazards block granularity used to
    dodge (abbreviations, periods inside code spans).

    A list item is its own block. Several of the round-trip requirements are bullets in one list,
    and treating the list as a single paragraph would give every one of them the same `context`
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


def split_sentences(text: str) -> list[str]:
    """`text` cut at the same boundaries a rule's own sentence is cut at."""
    out, position = [], 0
    while position < len(text):
        end = sentence_end(text, position)
        out.append(text[position:end].strip())
        if end <= position:
            break
        position = end
        while position < len(text) and text[position] in " \t":
            position += 1
    return out


def report_unclaimed(rules: list[dict]) -> None:
    """Warn about normative sentences sitting in a marked block that no rule identifies.

    Scoping a rule to its sentence made a gap visible that paragraph scope had hidden: a block
    can state several requirements while only one carries a marker, and the others then look
    covered because they sat inside the marked paragraph's text. Six such sentences existed the
    first time this ran.

    A warning, not a failure, deliberately. The specification is edited in passes, and a MUST
    written now with its id minted in the next commit must not block the build in between. This
    mirrors `coverage.rules` downstream, which warns for the same reason.
    """
    blocks: dict[tuple[str, str], list[dict]] = {}
    #: Claims are collected per file rather than per block, because contexts overlap: a rule
    #: whose lead-in ends in a colon takes in the list below it, and a rule marked on one of
    #: those list items is a block of its own. Matching only within a block reported such a
    #: sentence as unclaimed while the rule claiming it sat right there.
    claimed_in: dict[str, list[str]] = {}
    for rule in rules:
        source = rule["source"].split(":")[0]
        blocks.setdefault((source, rule.get("context") or rule["text"]), []).append(rule)
        claimed_in.setdefault(source, []).append(rule["text"])

    unclaimed: list[str] = []
    for (source, context), group in sorted(blocks.items()):
        claimed = claimed_in[source]
        # List items are judged one by one during extraction, where their structure is still
        # visible; collapsing them into sentences here would report the same thing twice, and
        # a lead-in merged with its first item reads as one sentence that "contains" the
        # lead-in's own text and so looks claimed when it is not.
        prose = " ".join(part for part in context.splitlines() if not LIST_ITEM.match(part))
        for sentence in split_sentences(prose):
            keyword = RFC2119.search(sentence)
            if not keyword:
                continue
            if any(sentence in text or text in sentence for text in claimed if text):
                continue
            where = f"{source}:{group[0]['source'].split(':')[1]}"
            unclaimed.append(f"{where} [{keyword.group(1)}] {sentence[:110]}")

    if unclaimed:
        print(f"WARN {len(unclaimed)} normative sentence(s) in a marked block carry no rule id:", file=sys.stderr)
        for line in unclaimed:
            print(f"       {line}", file=sys.stderr)
        print("     Mark each with :rule[OOLD-<AREA>-?]{...} and run `make rules-mint`.", file=sys.stderr)


def introduced_list(lines: list[str], end: int) -> int:
    """Extend a block over the list its trailing colon introduces.

    A requirement is routinely written as a lead-in ending in a colon followed by the forms it
    allows: "The version SHOULD be part of the schema's location:" and then three URL shapes.
    `paragraph_bounds` stops at the blank line between them, so `context` held the lead-in and
    none of the forms. For OOLD-VER-534a that left the catalogue recording a sentence which,
    read on its own, states no requirement at all.

    A list only. A colon can also introduce a `:::example`, and two rules here do exactly that,
    but the conformance section declares examples non-normative - pulling one into a rule's
    context would file text the specification disclaims as part of the requirement.
    """
    if not lines[end].rstrip().endswith(":"):
        return end

    probe = end + 1
    while probe < len(lines) and not lines[probe].strip():
        probe += 1
    if probe >= len(lines) or not LIST_ITEM.match(lines[probe]):
        return end

    last = probe
    while probe < len(lines):
        line = lines[probe]
        if line.strip():
            # An item, or a continuation line indented under one. Anything else ends the list,
            # including the blank-line-then-prose that follows it.
            if LIST_ITEM.match(line) or line.startswith((" ", "\t")):
                last = probe
            else:
                break
        probe += 1
    return last


def list_elements(lines: list[str], end: int, listed: int) -> list[str]:
    """The items of the list a block's trailing colon introduces, one string per item.

    Continuation lines are folded into the item above them, so each string is one complete
    element and can be asked whether it states a requirement of its own.
    """
    if listed <= end:
        return []
    items: list[str] = []
    for raw in lines[end + 1 : listed + 1]:
        if not raw.strip():
            continue
        if LIST_ITEM.match(raw):
            items.append(raw)
        elif items:
            items[-1] += " " + raw.strip()
    return items


def clean_block(block: list[str]) -> str:
    """A block's prose, with any list it introduces still shaped like a list.

    `clean_text` collapses a whole block to a single line. That is right for one sentence and
    wrong for a lead-in plus its items: it produced prose reading "the schema's location: - For
    single-schema versioning ..." with the bullets stranded mid-sentence. Items keep their own
    line here, so the catalogue page renders the list the specification actually wrote.
    """
    out: list[str] = []
    for raw in block:
        stripped = RULE.sub("", raw)
        if not stripped.strip():
            continue
        cleaned = clean_text(stripped)
        if not cleaned:
            continue
        item = LIST_ITEM.match(stripped)
        if item:
            out.append(f"{item.group(0).strip()} {cleaned}")
        elif out:
            out[-1] = f"{out[-1]} {cleaned}"
        else:
            out.append(cleaned)
    return "\n".join(out)


def extract_file(filename: str, problems: list[str], notes: list[str]) -> list[dict]:
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
            listed = introduced_list(lines, end)
            context = clean_block(lines[start : listed + 1])

            # A sentence never spans a line break in the marked prose (confirmed across every
            # current marker; see rule_scope), so the boundary search only needs the marker's own
            # source line, not the whole block.
            stop = sentence_end(line, match.end())
            text = clean_text(RULE.sub("", line[match.end() : stop]))

            # A colon-terminated sentence introduces a list, and whether that list belongs to
            # this rule depends on what is in it. Pure enumeration - no element states a
            # requirement of its own - is part of the requirement, and reading the lead-in
            # without it states nothing. An element that does carry an RFC 2119 keyword is its
            # own requirement and takes its own id, so the lead-in stays the umbrella over them.
            elements = list_elements(lines, end, listed)
            if elements and not any(RFC2119.search(RULE.sub("", e)) for e in elements):
                enumerated = " ".join(clean_text(RULE.sub("", e)) for e in elements)
                text = f"{text} {enumerated}".strip()
            for element in elements:
                stated = RFC2119.search(RULE.sub("", element))
                if stated and not RULE.search(element):
                    notes.append(
                        f"{where} [{stated.group(1)}] an item of the list {rule_id} introduces "
                        f"states its own requirement: {clean_text(element)[:88]}"
                    )

            # The marked *sentence* - not the paragraph around it - has to carry the requirement's
            # own keyword, or the id names something other than what it is attached to. Checked
            # unconditionally, even when `level=` is authored: an explicit level does not prove
            # the sentence itself states a requirement, only the prose does.
            if not RFC2119.search(text):
                problems.append(
                    f"{where}: {rule_id} marks a sentence with no RFC 2119 keyword: {text!r} - move "
                    "the marker to the start of the sentence that states the requirement."
                )
                continue

            # `level` is normally the first RFC 2119 keyword in the marked sentence. A sentence
            # that chains several requirements needs `level=` so the id names the intended one
            # rather than whichever keyword happens to come first; such sentences are candidates
            # for an editorial split into separate statements.
            level = attrs.get("level")
            if level:
                if not RFC2119.fullmatch(level):
                    problems.append(f"{where}: {rule_id} has level={level!r}, which is not an RFC 2119 keyword")
                    continue
            else:
                level = RFC2119.search(text).group(1)
            if level not in context:
                problems.append(f"{where}: {rule_id} declares level={level!r}, absent from the marked prose")
                continue

            # `machine_checkable` defaults to true only for document rules: an implementation rule
            # needs a library conformance suite and advisory text needs nothing at all. It records
            # that the requirement is mechanically decidable by inspecting a document - whether
            # any given validator actually enforces it is a separate, downstream fact.
            default_machine_checkable = "yes" if applies == "document" else "no"
            machine_checkable = attrs.get("machine_checkable", default_machine_checkable).lower() in (
                "yes",
                "true",
                "1",
            )

            record = {
                "id": rule_id,
                "area": area,
                "level": level,
                "applies_to": applies,
                "section": section,
                "summary": attrs.get("summary") or first_sentence(text),
                "text": text,
                "text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "context": context,
                "machine_checkable": machine_checkable,
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
    #: Warnings, not problems: an item that states its own requirement needs its own id, but the
    #: specification is edited in passes and a build must not stop between writing the prose and
    #: minting the id. Same reasoning as report_unclaimed.
    notes: list[str] = []
    rules: list[dict] = []
    for entry in cfg.SECTIONS:
        if entry.get("file"):
            rules.extend(extract_file(entry["file"], problems, notes))

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

    if notes:
        print(f"WARN {len(notes)} list item(s) state a requirement but carry no rule id:", file=sys.stderr)
        for note in notes:
            print(f"       {note}", file=sys.stderr)
        print("     Mark each with :rule[OOLD-<AREA>-?]{...} and run `make rules-mint`.", file=sys.stderr)

    report_unclaimed(rules)

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

    machine_checkable = sum(1 for r in rules if r["machine_checkable"])
    print(f"rules extracted: {len(rules)} ({machine_checkable} machine-checkable) -> meta/oold-rules.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
