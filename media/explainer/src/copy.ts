import type { IconKey } from './components/Icons';

export const copy = {
  hook: {
    // One row per domain. The three cells in a row are the same field, as three
    // systems in that domain actually spell it.
    rows: [
      {
        domain: 'Government forms',
        field: 'a surname',
        cells: ['familienname', 'last_name', 'NACHNAME_1'],
      },
      {
        domain: 'Research data',
        field: 'a temperature',
        cells: ['T_degC', 'temp_celsius', 'T2'],
      },
      {
        domain: 'Manufacturing',
        field: 'a batch identity',
        cells: ['batch_id', 'ChargenNr', 'LOT'],
      },
    ],
    lines: [
      'Many organisations store similar data.',
      'Almost none of them store it the same way.',
    ],
    punch: 'Data that looks right. Data nobody else can read.',
  },

  clarity: {
    kicker: 'OO-LD',
    groups: [
      'OO-LD closes the gap',
      'between data a machine can check',
      'and data a human can understand.',
    ],
    caption: 'One document that says what your data looks like, and what it means.',
  },

  mechanism: {
    kicker: 'How it works',
    schema: {
      label: 'JSON Schema',
      sub: 'structure you can validate',
      tokens: ['type', 'properties', 'required'],
    },
    context: {
      label: 'JSON-LD',
      sub: 'meaning you can link',
      tokens: ['@context', 'schema:name', '@id'],
    },
    union: 'One file. Both at once.',
    claim: 'A valid JSON Schema and a valid JSON-LD context, in the same document.',
    source: 'The artefact is the source. No modelling language, no build step, no two files to keep in sync.',
    outputsLead: 'Write it once, use it for',
    outputs: [
      { icon: 'validate' as IconKey, label: 'Validation' },
      { icon: 'graph' as IconKey, label: 'Linked data' },
      { icon: 'code' as IconKey, label: 'Code' },
      { icon: 'doc' as IconKey, label: 'Forms and UI' },
      { icon: 'store' as IconKey, label: 'Storage and APIs' },
    ],
  },

  domains: {
    kicker: 'Where it matters',
    cards: [
      {
        title: 'Government forms',
        body: 'Describe what you need, get the right form. Fill it with data you already have.',
        icon: 'doc' as IconKey,
      },
      {
        title: 'Research data',
        body: 'Custom CSV headers are not reproducible. A schema that carries its own meaning is.',
        icon: 'graph' as IconKey,
      },
      {
        title: 'Manufacturing',
        body: 'Twenty stations, one description each. Trace the parameters to the quality of what comes out.',
        icon: 'store' as IconKey,
      },
    ],
    closing: 'We target domains where data-driven innovation is blocked by poor interoperability.',
  },

  proof: {
    kicker: 'Why us',
    // Broken by hand: left to wrap, this splits as "solved it for / us,".
    story: [
      'We hit this problem making science FAIR,',
      'solved it for us, and are now extending',
      'that solution to other domains.',
    ],
    facts: [
      { icon: 'validate' as IconKey, label: 'Open specification' },
      { icon: 'code' as IconKey, label: 'oold Python library' },
      { icon: 'oold' as IconKey, label: 'Open source, Apache-2.0' },
      { icon: 'graph' as IconKey, label: 'Standards you already use' },
    ],
    site: 'oo-ld.org',
    repo: 'github.com/OO-LD',
  },
};

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

// 1-indexed line numbers of minimalSchema
export const contextLines = [4, 5, 6, 7];
export const schemaLines = [8, 9, 10, 11, 12];
