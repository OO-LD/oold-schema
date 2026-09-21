// Every on-screen string for episode 3. Code is excerpted from the oold-schema
// repository (examples/*.json) and from spec/sections/06-composition.md.
// Excerpting rules: whitespace normalised, and description, title and x-oold-*
// members dropped. Organization additionally drops its employees @reverse term
// and the x-oold-reverse-properties block that defines it. Nothing is added.

export const copy = {
  open: {
    kicker: 'Episode 3 of 5',
    headline: ['Building objects', 'from objects'],
    chips: ['$schema', '$id', '@context', 'type', 'properties'],
    recap: 'Episode 2 took one document apart. A model is rarely one document.',
    moves: [
      {
        tag: 'has a',
        line: 'A property whose value is another object',
        example: 'PersonWithPet has pets',
      },
      {
        tag: 'is a',
        line: 'A schema that extends another schema',
        example: 'Person extends Thing',
      },
    ],
    movesNote: 'Both are written with $ref. Where the $ref sits decides which one you get.',
  },

  hasA: {
    kicker: 'has a: the value of a property is an object',
    petFile: 'Pet.schema.json',
    petNote: 'A schema that stands on its own. Its name term maps to ex:petName.',
    ownerFile: 'PersonWithPet.schema.json',
    ownerHasA: { label: 'has a: pets', file: 'Pet.schema.json' },
    orgIsA: { label: 'is a', file: 'Thing.schema.json' },
    orgHasA: { label: 'has a: address', file: 'Address.schema.json' },
    ownerRefNote:
      'The array items carry the $ref, so every entry in pets is validated against Pet.',
    ownerCtxNote:
      'The same reference appears in @context, attached to the pets term. Pet terms apply inside pets and nowhere else.',
    orgFile: 'Organization.schema.json',
    orgNote:
      'Organization does both at once: an extension at the root, which is the next move, and an embedded object under the address property.',
    orgNote2:
      'Whether the value is one object or the items of an array, the reference is reflected as a scoped @context on the term.',
    contextLabel: 'JSON-LD side',
    schemaLabel: 'JSON Schema side',
  },

  isA: {
    kicker: 'is a: a schema extends another schema',
    thingFile: 'Thing.schema.json',
    thingNote:
      'Thing maps id to @id, type to @type and name to schema:name, and declares id and name as properties.',
    personFile: 'Person.schema.json',
    personIsA: { label: 'is a', file: 'Thing.schema.json' },
    personNote:
      'Person names Thing twice: in allOf so validators apply Thing rules, and in @context so JSON-LD resolves Thing terms.',
    scalarNote:
      'works_for holds an IRI, not an embedded object. It takes x-oold-range, the keyword from episode 2, instead of a $ref, so it contributes no scoped context.',
    extends: 'extends',
    chain: [
      { file: 'Thing.schema.json', lines: ['id', 'name'] },
      { file: 'Person.schema.json', lines: ['allOf: Thing.schema.json', 'works_for'] },
      { file: 'Researcher.schema.json', lines: ['allOf: Person.schema.json', 'affiliation'] },
    ],
    chainNote: 'A Researcher instance is a valid Person instance and a valid Thing instance.',
  },

  diff: {
    kicker: 'one keyword, two meanings',
    columns: [
      {
        tag: 'has a',
        title: 'The value of a property is another object',
        points: [
          'The $ref sits under a property',
          'Reflected as a scoped @context on that term',
          'Pet terms resolve inside pets only',
          'A person with a pet is not a pet',
        ],
      },
      {
        tag: 'is a',
        title: 'A schema extends another schema',
        points: [
          'The $ref sits at the root, inside allOf',
          'Reflected as an entry in the root @context array',
          'Thing terms apply to the whole object',
          'Every Person is a Thing',
        ],
      },
    ],
  },

  reflect: {
    kicker: 'what happens to the @context',
    rule: 'It MUST NOT be required to further process an OO-LD schema document in order to interpret it as a JSON-LD context.',
    implies:
      'This implies that all occurrences of $ref in the schema are reflected in the JSON-LD context.',
    source: 'OO-LD specification, Composition',
    ruleNote: 'The composed document is still a context. No build step in between.',
    tableHead: ['Where the reference sits', 'Where it is reflected', 'In the examples'],
    table: [
      {
        where: 'In allOf at the root',
        into: 'An entry in the root @context array',
        example: 'Person extends Thing',
      },
      {
        where: 'Under an object-valued property',
        into: 'A scoped @context on that property term',
        example: 'PersonWithPet, pets',
      },
      {
        where: 'A value that is an IRI string',
        into: 'Not a $ref: the type goes in x-oold-range',
        example: 'Person, works_for',
      },
    ],
    exampleFile: 'examples/spec/composition-reflection.json',
    exampleNote:
      'B in allOf at the root and p0, which is not object-valued, are listed at the root of the @context.',
    exampleNote2:
      'p1 and p2 are object-valued, so their references become a scoped context on the term. p3 branches with oneOf, so its branch terms are scoped inline instead, where they cannot collide at the root.',
    mergeKicker: 'the @context array resolves in order',
    mergeLabels: [
      { index: '1', title: 'Thing.schema.json', text: 'The inherited context, resolved first' },
      { index: '2', title: 'The schema\'s own object', text: 'Resolved last, so these terms win' },
    ],
    mergeNote:
      'A processor resolves the array in order and later entries override earlier ones, so a schema overrides an inherited term by putting its own object last.',
    mergeSource: 'OO-LD specification, Merging remote contexts',
  },

  closing: {
    kicker: 'closing a composed object',
    badTag: 'Not this',
    badNote:
      'allOf is conjunctive, so additionalProperties never sees the members the other branches contribute and rejects them.',
    goodTag: 'This',
    goodSource: 'OO-LD specification, Closing composed objects',
    goodNote:
      'unevaluatedProperties is evaluated after the allOf branches, so it accounts for their properties.',
    goodNote2:
      'An instance may carry the Person properties, employeeId, and $schema and @context. Anything else is rejected.',
  },

  finish: {
    kicker: 'one context line, the whole nesting',
    instanceFile: 'PersonWithPet.instance.json',
    asWrittenLabel: 'As written',
    inlinedLabel: 'Equivalent, inlined',
    instanceNote:
      'Both name terms coexist: the outer one maps to schema:name, the inner one to ex:petName, because the inner one is scoped to pets.',
    recapTitle: 'Composition in one screen',
    recap: [
      '$ref under a property: the value is another object, and its terms are scoped to that property.',
      '$ref in allOf at the root: the schema extends another schema, and its terms apply to the whole object.',
      'Every $ref is reflected into the @context, so the composed document stays a context.',
    ],
    nextKicker: 'Episode 4',
    next: [
      'What that $schema line does,',
      'how instances get identity,',
      'and how documents become a graph.',
    ],
  },
};

export const petSchema = `{
  "$schema": "https://oo-ld.org/latest/meta/oold-meta-schema.json",
  "$id": "Pet.schema.json",
  "@context": {
    "ex": "https://example.org/",
    "name": "ex:petName"
  },
  "title": "Pet",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the pet" }
  }
}`;

export const petContextLines = [4, 5, 6, 7];
export const petSchemaLines = [2, 3, 9, 10, 11, 12];

export const ownerContext = `"@context": {
  "ex": "https://example.org/",
  "schema": "http://schema.org/",
  "name": "schema:name",
  "pets": {
    "@id": "ex:hasPet",
    "@container": "@set",
    "@context": "Pet.schema.json"
  }
}`;

export const ownerProperties = `"type": "object",
"properties": {
  "name": { "type": "string" },
  "pets": {
    "type": "array",
    "items": { "$ref": "Pet.schema.json" }
  }
}`;

export const orgContext = `"@context": [
  "Thing.schema.json",
  {
    "schema": "http://schema.org/",
    "address": {
      "@id": "schema:address",
      "@context": "Address.schema.json"
    }
  }
]`;

export const orgProperties = `"allOf": [ { "$ref": "Thing.schema.json" } ],
"type": "object",
"properties": {
  "address": {
    "type": "object",
    "$ref": "Address.schema.json"
  }
}`;

export const thingContext = `"@context": {
  "@version": 1.1,
  "id": "@id",
  "type": "@type",
  "schema": "http://schema.org/",
  "name": "schema:name"
}`;

export const thingProperties = `"type": "object",
"properties": {
  "id": { "type": "string", "format": "iri" },
  "name": { "type": "string" }
}`;

export const personContext = `"@context": [
  "Thing.schema.json",
  {
    "schema": "http://schema.org/",
    "works_for": {
      "@id": "schema:worksFor",
      "@type": "@id"
    }
  }
]`;

export const personProperties = `"allOf": [ { "$ref": "Thing.schema.json" } ],
"type": "object",
"properties": {
  "works_for": {
    "type": "string",
    "format": "iri-reference",
    "x-oold-range": "Organization.schema.json"
  }
}`;

export const diffHasA = `"pets": {
  "type": "array",
  "items": { "$ref": "Pet.schema.json" }
}`;

export const diffIsA = `"allOf": [
  { "$ref": "Thing.schema.json" }
]`;

export const reflectionExample = `{
  "@context": [
    "B.schema.json",
    "P0.schema.json",
    { "p1": { "@context": "P1.schema.json" } },
    { "p2": { "@context": ["P2a.schema.json", "P2b.schema.json"] } },
    { "p3": { "@context": { "keyword_in_P3a": "ex:Property1", "keyword_in_P3b": "ex:Property2" } } }
  ],
  "$id": "A.schema.json",
  "allOf": [ { "$ref": "B.schema.json" } ],
  "properties": {
    "p0": { "type": "string", "$ref": "P0.schema.json" },
    "p1": { "type": "object", "$ref": "P1.schema.json" },
    "p2": { "type": "object", "allOf": [ { "$ref": "P2a.schema.json" }, { "$ref": "P2b.schema.json" } ] },
    "p3": { "oneOf": [ { "$ref": "P3a.schema.json" }, { "$ref": "P3b.schema.json" } ] }
  }
}`;

export const reflectionContextLines = [2, 3, 4, 5, 6, 7, 8];
export const reflectionSchemaLines = [9, 10, 11, 12, 13, 14, 15, 16];

export const closingBad = `"allOf": [ { "$ref": "Person.schema.json" } ],
"properties": {
  "employeeId": { "type": "string" }
},
"additionalProperties": false`;

export const closingGood = `"allOf": [ { "$ref": "Person.schema.json" } ],
"properties": {
  "employeeId": { "type": "string" }
},
"unevaluatedProperties": false`;

export const instanceCode = `{
  "@context": "PersonWithPet.schema.json",
  "$schema": "PersonWithPet.schema.json",
  "name": "Max",
  "pets": [ { "name": "Bruno" } ]
}`;

// Only the @context line is grouped. The $schema line stays plain: what it does
// for an instance is episode 4.
export const instanceContextLines = [2];

export const inlinedContext = `{
  "@context": {
    "name": "schema:name",
    "pets": {
      "@id": "ex:hasPet",
      "@context": { "name": "ex:petName" }
    }
  },
  "$schema": "PersonWithPet.schema.json",
  "name": "Max",
  "pets": [ { "name": "Bruno" } ]
}`;

export const inlinedContextLines = [2, 3, 4, 5, 6, 7, 8];
