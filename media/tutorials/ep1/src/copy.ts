// Every on-screen string of episode 1. A translation is a copy of this file.
// Field names, schema keywords and quoted statements are taken from the
// oold-schema sources listed in the episode brief; nothing here is invented.

export const copy = {
  open: {
    kicker: 'Episode 1 of 5',
    groups: ['Why data needs meaning,', 'and why a schema is not enough.'],
    caption: 'Nothing to know in advance. The series starts here.',
  },

  collision: {
    kicker: 'The same word',
    title: 'Two systems. One field name.',
    left: {
      domain: 'Government form',
      code: `{
  "name": "Mustermann"
}`,
      means: 'Here it is the family name of the applicant.',
    },
    right: {
      domain: 'Research data',
      code: `{
  "name": "Sample A-17"
}`,
      means: 'Here it is the label of a measured sample.',
    },
    punch: 'Same key. Same type. Two different things.',
  },

  synonyms: {
    kicker: 'The same thing',
    title: 'One thing. Three field names.',
    lead: 'In each domain, three systems record the same field three different ways.',
    askLabel: 'same field?',
    ask: '?',
    rows: [
      {
        domain: 'Government forms',
        means: 'the family name',
        cells: ['familienname', 'last_name', 'NACHNAME_1'],
      },
      {
        domain: 'Research data',
        means: 'the sample label',
        cells: ['name', 'probenname', 'SAMPLE_LABEL'],
      },
      {
        domain: 'Manufacturing',
        means: 'the batch identity',
        cells: ['batch_id', 'ChargenNr', 'LOT'],
      },
    ],
    missing: 'Nothing in any of these documents says that the three are one field.',
    punch: 'A person reads the field name and guesses. A machine cannot.',
  },

  schema: {
    kicker: 'Add a schema',
    title: 'A JSON Schema checks the shape.',
    code: `{
  "title": "Minimal",
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  }
}`,
    passLead: 'Both of these pass',
    verdict: 'valid',
    cases: [
      { domain: 'Government form', code: '{ "name": "Mustermann" }' },
      { domain: 'Research data', code: '{ "name": "Sample A-17" }' },
    ],
    punch: 'The schema cannot tell them apart. It was never asked to.',
  },

  shape: {
    kicker: 'What a schema says',
    title: 'Shape, and nothing else.',
    says: {
      label: 'Says',
      sub: 'how the data is built',
      tokens: ['type', 'properties', 'required'],
    },
    silent: {
      label: 'Says nothing about',
      sub: 'what any of it means',
      items: [
        'whose name it is',
        'in which sense the word is used',
        'which field elsewhere is the same field',
      ],
    },
    statement: 'JSON Schema does not include linked data concepts.',
    source: 'OO-LD guide, Related Work',
  },

  meaning: {
    kicker: 'What a context says',
    title: 'A JSON-LD context supplies meaning.',
    code: `{
  "@context": {
    "schema": "http://schema.org/",
    "name": "schema:name"
  }
}`,
    mapFrom: 'name',
    mapTo: 'http://schema.org/name',
    mapNote: 'One term, one global identifier. Any system that knows the identifier knows the field.',
  },

  loose: {
    kicker: 'What a context does not say',
    title: 'It constrains nothing.',
    lead: 'The same context accepts both of these',
    cases: ['{ "name": "Mustermann" }', '{ "name": [7, true] }'],
    verdict: 'both expand to http://schema.org/name',
    note:
      'A string on one side, a number and a boolean on the other. Nothing in the context rules either out.',
    statement: 'JSON-LD does not restrict the structure of a JSON file.',
    source: 'OO-LD guide, Related Work',
  },

  neither: {
    kicker: 'The gap',
    title: 'Neither one alone is enough.',
    cols: ['JSON Schema', 'JSON-LD'],
    rows: [
      { label: 'Constrains the shape', values: [true, false] },
      { label: 'Carries the meaning', values: [false, true] },
    ],
    caption:
      'A schema constrains shape and says nothing about meaning. A context supplies meaning and says nothing about shape.',
  },

  consequence: {
    kicker: 'The consequence',
    groups: ['Data that validates perfectly', 'and is still unusable by anyone else.'],
    caption:
      'The receiver gets a string called name. Everything needed to use it stayed with whoever wrote the form.',
  },

  // The statement is the promise the series is built on, not something this
  // episode demonstrated: no file has been on screen yet. Episode 2 opens the
  // file and carries the attribution, so the source line is left off here.
  close: {
    kicker: 'OO-LD',
    title: 'Both, in one document.',
    statement:
      'An OO-LD schema document is always both a valid JSON Schema document and a JSON-LD remote context.',
    promise: 'You have not seen that document yet.',
    nextKicker: 'Episode 2',
    next: ['One real file,', 'line by line.'],
  },
};
