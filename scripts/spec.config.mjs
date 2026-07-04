// Single source of truth for the ReSpec spec's configuration and structure.
// Consumed by scripts/build-spec.mjs to generate docs/spec/index.html.

// Serialized verbatim into `var respecConfig = {...}` in the generated <head>.
// See https://respec.org/docs/ for all options.
export const respec = {
  specStatus: "base", // https://respec.org/docs/#specStatus
  shortName: "oold",
  subtitle: "OO-LD Recommendation 1.0",
  // Static editor list for now; automating this (e.g. from git / CONTRIBUTORS)
  // is a follow-up to discuss.
  editors: [
    { name: "Simon Stier", company: "OO-LD", companyURL: "https://github.com/OO-LD" },
    { name: "Lukas Gold", company: "OO-LD", companyURL: "https://github.com/OO-LD" },
    { name: "Andreas Räder", company: "OO-LD", companyURL: "https://github.com/OO-LD" },
  ],
  github: {
    repoURL: "https://github.com/OO-LD/oold-schema",
    branch: "main",
  },
  latestVersion: "https://OO-LD.github.io/oold-schema/spec/",
  edDraftURI: "https://OO-LD.github.io/oold-schema/spec/",
  // This is a community specification, not a W3C track document.
  logos: [
    {
      src: "../assets/OO-LD_logo.jpg",
      alt: "OO-LD logo",
      height: 80,
      url: "https://OO-LD.github.io/oold-schema/",
    },
  ],
  lint: { "no-http-props": false },
  localBiblio: {
    JSONSCHEMA: {
      title: "JSON Schema: A Media Type for Describing JSON Documents (2020-12)",
      href: "https://json-schema.org/draft/2020-12/json-schema-core",
      publisher: "JSON Schema Organization",
      status: "Internet-Draft",
    },
    "OOLD-META": {
      title: "OO-LD Meta-Schema",
      href: "https://github.com/OO-LD/oold-schema/blob/main/meta/oold-meta-schema.json",
      publisher: "OO-LD",
    },
  },
};

// Drives the generated #terminology <dl> (term = visible label, lt = ReSpec
// data-lt aliases, def = Markdown definition). Cross-refs [](#id) are resolved.
export const terminology = [
  {
    term: "OO-LD schema",
    lt: "OO-LD schema|schema document",
    def: "A document that is simultaneously a valid JSON Schema and a reference-able JSON-LD remote context.",
  },
  {
    term: "OO-LD instance",
    lt: "OO-LD instance|instance document|instance",
    def: "A JSON document that conforms to an OO-LD schema and is itself a valid JSON-LD document.",
  },
  {
    term: "remote context",
    lt: "remote context",
    def: "A JSON-LD context referenced by URL, as defined in [[JSON-LD11]] §3.1.",
  },
  {
    term: "resolved schema",
    lt: "resolved schema|resolved view",
    def: "A single, merged view of a composed schema (see [](#merge-and-override-model)).",
  },
  {
    term: "range",
    lt: "range",
    def: "A type constraint on an IRI-valued property (see [](#range-of-properties)).",
  },
  {
    term: "reverse property",
    lt: "reverse property",
    def: "A property that is stored on and edited from both ends of a relation (see [](#reverse-properties)).",
  },
];

// Terms listed in the #index appendix (as [=ref=]). Includes OO-LD, whose <dfn>
// lives in the abstract rather than in the terminology <dl>.
export const indexTerms = [
  "OO-LD",
  "OO-LD schema",
  "OO-LD instance",
  "remote context",
  "resolved schema",
  "range",
  "reverse property",
];

// Section order. `file` entries are rendered from spec/sections/; `generate`
// entries are produced from this config. `headingless` sections (abstract, sotd)
// carry no <h2> - ReSpec supplies their heading - so their id comes from here.
export const sections = [
  { file: "00-abstract.md", id: "abstract", headingless: true },
  { file: "01-sotd.md", id: "sotd", headingless: true },
  { file: "02-introduction.md" },
  { file: "03-conformance.md" },
  { generate: "terminology" },
  { file: "05-basic-concepts.md" },
  { file: "06-composition.md" },
  { file: "07-schema-instances.md" },
  { file: "08-identification-versioning.md" },
  { file: "09-extensions.md" },
  { file: "10-meta-schema.md" },
  { file: "11-iana.md" },
  { generate: "index" },
];
