// Every on-screen string of episode 2. Code samples are copied verbatim from the
// oold-schema repository; the file each one comes from is named next to it.

export const minimalSchema = `{
  "$schema": "https://oo-ld.org/latest/meta/oold-meta-schema.json",
  "$id": "Minimal.schema.json",
  "@context": {
    "schema": "http://schema.org/",
    "name": "schema:name"
  },
  "title": "Minimal",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the thing" }
  }
}`;

// 1-indexed line numbers inside minimalSchema
export const minimalSchemaLine = 2;
export const minimalIdLine = 3;
export const minimalContextLines = [4, 5, 6, 7];
export const minimalStructureLines = [8, 9, 10, 11, 12];

export const personSchema = `{
  "$schema": "https://oo-ld.org/latest/meta/oold-meta-schema.json",
  "$id": "Person.schema.json",
  "x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
  "x-oold-version": "1.0.0",
  "x-oold-instance-rdf-type": ["schema:Person"],
  "@context": [
    "Thing.schema.json",
    {
      "schema": "http://schema.org/",
      "works_for": { "@id": "schema:worksFor", "@type": "@id" }
    }
  ],
  "title": "Person",
  "x-oold-multilang-title": { "en": "Person", "de": "Person" },
  "allOf": [ { "$ref": "Thing.schema.json" } ],
  "type": "object",
  "properties": {
    "works_for": {
      "type": "string",
      "format": "iri-reference",
      "description": "Organization the person works for (IRI reference)",
      "x-oold-range": "Organization.schema.json"
    }
  }
}`;

// 1-indexed line numbers inside personSchema
export const personContextLines = [7, 8, 9, 10, 11, 12, 13];
export const personStructureLines = [2, 3, 14, 17, 18, 19, 20, 21, 22, 24, 25];
export const personOoldLines = [4, 5, 6, 15, 23];
// allOf / $ref: shown, named, and handed to episode 3
export const personDeferredLine = 16;

// Three of the eight entries of meta/oold-meta-schema.json. The elisions keep the
// omission visible in the code itself, not only in the label.
export const vocabularyExcerpt = `"$vocabulary": {
  "https://json-schema.org/draft/2020-12/vocab/core": true,
  ...
  "https://json-schema.org/draft/2020-12/vocab/validation": true,
  ...
  "https://oo-ld.org/latest/vocab/oold": false
}`;

// Lines 4 to 6 of examples/Person.schema.json, verbatim.
export const ooldKeywordsExcerpt = `"x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
"x-oold-version": "1.0.0",
"x-oold-instance-rdf-type": ["schema:Person"],`;

export const personContextFragment = `"@context": [
  "Thing.schema.json",
  {
    "schema": "http://schema.org/",
    "works_for": { "@id": "schema:worksFor", "@type": "@id" }
  }
]`;

export const copy = {
  open: {
    kicker: 'Episode 2 of 5',
    groups: ['Anatomy of', 'an OO-LD document'],
    recap: 'You have one document that carries structure and meaning at the same time.',
    question: 'What is actually inside it?',
  },

  file: {
    kicker: 'One real file',
    label: 'examples/Minimal.schema.json',
    caption: 'Thirteen lines, and nothing hidden.',
    anchorsLead: 'Four things to read:',
    anchors: ['$schema', '$id', '@context', 'title, type, properties'],
  },

  schemaKeyword: {
    kicker: 'Line 2',
    lead: 'Declares the dialect: this document is an OO-LD schema.',
    fragment: '"$schema": "https://oo-ld.org/latest/meta/oold-meta-schema.json"',
    points: [
      'The OO-LD meta-schema extends the standard JSON Schema 2020-12 meta-schema.',
      'It declares the OO-LD vocabulary as optional, so generic validators still accept OO-LD schemas.',
      'It checks that the keywords are well formed. The behaviour behind them comes from OO-LD-aware tooling.',
    ],
    metaKicker: 'Meta-schema',
    excerptLabel: 'meta/oold-meta-schema.json (excerpt)',
    excerptNote: 'false is what makes the OO-LD vocabulary optional.',
  },

  idKeyword: {
    kicker: 'Line 3',
    lead: 'A stable identity for the schema.',
    fragment: '"$id": "Minimal.schema.json"',
    required: '"required": ["$id"]',
    points: [
      'The OO-LD meta-schema carries this obligation at document level: every OO-LD schema document has an $id.',
      'Nested subschemas recurse into the dialect body instead, so a fragment inside properties or $defs legitimately has none.',
    ],
  },

  context: {
    kicker: 'Lines 4 to 7',
    lead: 'Two jobs in one object.',
    prefix: {
      title: 'Prefix map',
      fragment: '"schema": "http://schema.org/"',
      note: 'A short name for a namespace.',
    },
    term: {
      title: 'Term mapping',
      fragment: '"name": "schema:name"',
      note: 'The property name means schema:name.',
    },
    expansion: ['name', 'schema:name', 'http://schema.org/name'],
    expansionNote: 'schema: stands for http://schema.org/, so the term resolves to a full IRI.',
    roles: [
      'The JSON Schema keywords describe the structure. @context describes the meaning.',
      'A JSON Schema validator ignores this entry.',
      'A JSON-LD processor loads the schema as a remote context and reads exactly this entry.',
    ],
    remote: 'A schema is consumed as a JSON-LD remote context. It is never expanded as a document.',
  },

  structure: {
    kicker: 'Lines 8 to 12',
    lead: 'Plain JSON Schema, unchanged.',
    rows: [
      { code: '"title": "Minimal"', note: 'The name of the type.' },
      { code: '"type": "object"', note: 'An instance is a JSON object.' },
      { code: '"properties": { ... }', note: 'The fields, each described by its own schema.' },
      {
        code: '"name": { "type": "string", "description": "Name of the thing" }',
        note: 'One field called name, holding a string.',
      },
    ],
    caption: 'Nothing here is OO-LD specific. Any JSON Schema 2020-12 validator reads it.',
  },

  roles: {
    kicker: 'The same bytes, twice',
    callback: 'The line episode 1 closed on, now on the real bytes:',
    claim:
      'An OO-LD schema document is always both a valid JSON Schema document and a JSON-LD remote context.',
    source: 'OO-LD guide, Introduction',
    schema: {
      label: 'JSON Schema',
      sub: 'read by a validator',
      tokens: ['$schema', '$id', 'title', 'type', 'properties'],
    },
    context: {
      label: 'JSON-LD',
      sub: 'loaded as a remote context',
      tokens: ['@context'],
    },
    punch: 'One file. Two readers.',
    sub: 'Five keywords for the validator, one entry for the processor.',
  },

  strict: {
    kicker: 'One caveat',
    excerptLabel: 'examples/Person.schema.json (excerpt)',
    qualifies:
      'The optional vocabulary is what makes a generic validator accept the schema. It does not teach that validator the x-oold-* keywords.',
    lead: 'JSON Schema 2020-12 treats unknown keywords as annotations and ignores them for validation.',
    // Two groups, so the headline breaks where it reads. Joined again where the
    // same sentence is set as a caption.
    problem: ['A validator that defaults to', 'a strict mode rejects them.'],
    example: 'for example Ajv',
    fixLead: 'So the validator gets one of two settings:',
    fixes: ['Run it in non-strict mode', 'Register the x-oold-* keywords'],
    close: 'The fix sits in the validator setup, not in the document.',
  },

  person: {
    kicker: 'examples/Person.schema.json',
    notes: [
      'The same four anchors, in the same order.',
      'Plus a handful of x-oold-* keywords.',
      'allOf and $ref build on other schemas. That is episode 3.',
    ],
    contextLead: '@context can also be an array.',
    contextNotes: [
      'A reference to another context, plus an inline map.',
      'works_for maps to schema:worksFor, and its value is an IRI reference.',
    ],
    keywordsLead: 'OO-LD keywords on top of JSON Schema',
    keywords: [
      { code: 'x-oold-uuid', note: 'Stable UUID identifying this schema across versions and locations.' },
      { code: 'x-oold-version', note: 'Semantic version of this schema.' },
      {
        code: 'x-oold-instance-rdf-type',
        note: 'The rdf:type carried by instances of this schema.',
      },
      { code: 'x-oold-multilang-title', note: 'Language map of translated title values.' },
      {
        code: 'x-oold-range',
        note: 'Type constraint on the target of an IRI-valued property.',
      },
    ],
    keywordsCaption: 'One caveat comes with them.',
  },

  close: {
    kicker: 'Recap',
    rows: [
      { code: '$schema', note: 'which dialect this is' },
      { code: '$id', note: 'a stable identity' },
      { code: '@context', note: 'what the fields mean' },
      { code: 'title, type, properties', note: 'what the data looks like' },
    ],
    nextKicker: 'Episode 3',
    next: ['Building bigger objects', 'out of these documents.'],
  },
};
