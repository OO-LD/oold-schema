#!/usr/bin/env python3
"""Structural lint for the generated ReSpec spec (docs/spec/index.html).

Catches broken cross-references, unknown term refs, and unresolved bibliography
refs that would otherwise only surface when ReSpec renders in a browser. Fast,
no browser required. Run after render_spec.py.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import spec_config as cfg  # noqa: E402

html = open(os.path.join(ROOT, "docs", "spec", "index.html"), encoding="utf-8").read()

# ReSpec resolves these bibliography keys from its built-in database; anything
# else must be declared in localBiblio.
KNOWN_BIBLIO = {"RFC2119", "RFC7386", "RFC3986", "RFC6906", "JSON-LD11"}

EXPECTED_IDS = sorted([
    "abstract", "basic-concepts", "compatibility", "composition", "conformance",
    "design-goals", "expressiveness", "extensions", "iana", "identification",
    "identification-versioning", "identity", "index", "interoperability",
    "introduction", "jsonld-extensions", "jsonschema-extensions",
    "localizing-instance-values", "localizing-schema-annotations",
    "merge-and-override-model", "merging-remote-contexts", "meta-schema",
    "multi-mapping", "multilanguage", "ontology-class-iri", "processing-mode",
    "range-of-properties", "referencing-schema", "reverse-properties",
    "schema-instances", "security", "semantic-type", "sotd", "terminology",
    "ui-generation", "versioning", "why-x-oold-ref",
])

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
    errors.append("unexpected section ids: " + ", ".join(extra) + " (update EXPECTED_IDS if intentional)")

if errors:
    print("spec check FAILED:", file=sys.stderr)
    for e in errors:
        print("  - " + e, file=sys.stderr)
    sys.exit(1)
print(f"spec check OK ({len(section_ids)} sections, {len(aliases)} term aliases)")
