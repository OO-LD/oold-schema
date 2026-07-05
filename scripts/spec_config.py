"""Configuration and structure for the ReSpec spec (consumed by render_spec.py).

Ported from the former spec.config.mjs when the spec generator moved to Python.
"""

# Serialized verbatim into `var respecConfig = {...}` in the generated <head>.
# See https://respec.org/docs/ for all options.
RESPEC = {
    "specStatus": "base",  # minimal output: no W3C boilerplate, no status banner (respec.org/docs). Copyright comes from the custom p.copyright in render_spec.py; no `license` key (which would trigger a W3C license check).
    "shortName": "oold",
    # `subtitle` is injected at render time from the current git tag (see render_spec.py); do not hardcode a version here.
    "editors": [
        {"name": "Simon Stier", "company": "OO-LD", "companyURL": "https://github.com/OO-LD"},
        {"name": "Lukas Gold", "company": "OO-LD", "companyURL": "https://github.com/OO-LD"},
        {"name": "Andreas Räder", "company": "OO-LD", "companyURL": "https://github.com/OO-LD"},
    ],
    "github": {"repoURL": "https://github.com/OO-LD/oold-schema", "branch": "main"},
    "latestVersion": "https://OO-LD.github.io/oold-schema/spec/",
    "edDraftURI": "https://OO-LD.github.io/oold-schema/spec/",
    "logos": [
        {
            "src": "../assets/OO-LD_logo.jpg",
            "alt": "OO-LD logo",
            "height": 80,
            "url": "https://OO-LD.github.io/oold-schema/",
        }
    ],
    "lint": {"no-http-props": False},
    "localBiblio": {
        "JSONSCHEMA": {
            "title": "JSON Schema: A Media Type for Describing JSON Documents (2020-12)",
            "href": "https://json-schema.org/draft/2020-12/json-schema-core",
            "publisher": "JSON Schema Organization",
            "status": "Internet-Draft",
        },
        "OOLD-META": {
            "title": "OO-LD Meta-Schema",
            "href": "https://github.com/OO-LD/oold-schema/blob/main/meta/oold-meta-schema.json",
            "publisher": "OO-LD",
        },
    },
}

# Drives the generated #terminology <dl> (term = label, lt = ReSpec data-lt
# aliases, def = Markdown definition; cross-refs [](#id) are resolved by ReSpec).
TERMINOLOGY = [
    {"term": "OO-LD schema", "lt": "OO-LD schema|schema document",
     "def": "A document that is simultaneously a valid JSON Schema and a reference-able JSON-LD remote context."},
    {"term": "OO-LD instance", "lt": "OO-LD instance|instance document|instance",
     "def": "A JSON document that conforms to an OO-LD schema and is itself a valid JSON-LD document."},
    {"term": "remote context", "lt": "remote context",
     "def": "A JSON-LD context referenced by URL, as defined in [[JSON-LD11]] §3.1."},
    {"term": "resolved schema", "lt": "resolved schema|resolved view",
     "def": "A single, merged view of a composed schema (see [](#merge-and-override-model))."},
    {"term": "range", "lt": "range",
     "def": "A type constraint on an IRI-valued property (see [](#range-of-properties))."},
    {"term": "reverse property", "lt": "reverse property",
     "def": "A property that is stored on and edited from both ends of a relation (see [](#reverse-properties))."},
]

# Terms listed in the #index appendix (as [=ref=]); OO-LD's <dfn> is in the abstract.
INDEX_TERMS = [
    "OO-LD", "OO-LD schema", "OO-LD instance", "remote context",
    "resolved schema", "range", "reverse property",
]

# Section order. `file` entries render spec/sections/<file>; `generate` entries
# are produced from this config. `headingless` sections (abstract, sotd) carry
# no <h2> - ReSpec supplies their heading - so their id comes from here.
SECTIONS = [
    {"file": "00-abstract.md", "id": "abstract", "headingless": True},
    {"file": "01-sotd.md", "id": "sotd", "headingless": True},
    {"file": "02-introduction.md"},
    {"file": "03-conformance.md"},
    {"generate": "terminology"},
    {"file": "05-basic-concepts.md"},
    {"file": "06-composition.md"},
    {"file": "07-schema-instances.md"},
    {"file": "08-identification-versioning.md"},
    {"file": "09-extensions.md"},
    {"file": "10-meta-schema.md"},
    {"file": "11-iana.md"},
    {"generate": "index"},
]
