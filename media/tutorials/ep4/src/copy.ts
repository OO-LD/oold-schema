// Every on-screen string for episode 4. Code is copied from the oold-schema
// repository (examples/, docs/guide/, spec/sections/); only whitespace and
// omitted annotation members differ from the source files. The expanded
// JSON-LD and the triples are the output of a JSON-LD processor run over the
// committed instance files, not hand-written.

export const copy = {
  open: {
    kicker: 'Episode 4 of 5',
    headline: ['Identity, instances', 'and the graph'],
    recap: 'Three episodes on the document: structure and meaning in one file, composed from smaller schemas, and at the end of episode 3 a first instance of one.',
    turn: 'What it does not yet say is who it is about.',
    question: 'How does an instance get an identity, and how does a pile of documents become a graph?',
  },

  instance: {
    kicker: 'the instance',
    title: 'A schema, and an instance of it.',
    schemaFile: 'RdfPerson.schema.json',
    instanceFile: 'RdfPerson.instance.json',
    note: 'Same pair as the instance episode 3 closed on: the context it is read with, the schema it is checked against.',
    turn: 'New here is the line below them: the id.',
  },

  identity: {
    kicker: 'identity',
    title: 'Which entity is this?',
    chain: [
      { label: 'in the schema @context', code: '"id": "@id"' },
      { label: 'in the instance', code: '"id": "ex:alice"' },
      { label: 'expanded', code: '"@id": "https://example.org/alice"' },
    ],
    chainNote: 'The schema aliases the JSON-LD node identifier to a plain id key, so instance keys stay variable-name friendly.',
    withLabel: 'with an id',
    withNode: '<https://example.org/alice>',
    withNote: 'a named entity other documents can point at',
    withoutLabel: 'without one',
    withoutNode: '_:b0',
    withoutNote: 'an anonymous blank node, as in PersonWithPet.instance.json',
    statement: 'Without an @id the entity is an anonymous blank node and cannot be referenced.',
    source: 'OO-LD specification, Schema Instances',
    typeLabel: 'and what kind of thing it is',
    typeCode: '"type": "schema:Person"',
    typeNote: 'The type may also live in the schema alone, as x-oold-instance-rdf-type, and be materialized as @type when tooling exports the instance.',
  },

  expand: {
    kicker: 'expansion',
    title: 'Instance plus context is already RDF.',
    instanceLabel: 'instance',
    expandedLabel: 'expanded JSON-LD',
    columns: ['subject', 'predicate', 'object'],
    claim: 'An OO-LD instance document is always a valid JSON-LD document.',
    source: 'OO-LD guide, Introduction',
  },

  forms: {
    kicker: 'value forms',
    title: 'Three ways to point at something.',
    rows: [
      {
        name: 'Literal',
        sub: 'a plain value',
        code: '"address": "Mainstreet 1, 10115 Example City"',
      },
      {
        name: 'Reference',
        sub: 'another entity, named by its IRI',
        code: '"address": { "id": "https://example.org/address/A1" }',
      },
      {
        name: 'Embedded object',
        sub: 'no identity of its own',
        code: '"address": { "type": "PostalAddress", "streetAddress": "..." }',
      },
    ],
    note: 'Each form projects to RDF differently, so the schema @context has to be set up to match the forms a property allows.',
    source: 'OO-LD guide, Schema Instances',
  },

  reference: {
    kicker: 'typed references',
    title: 'An IRI in a field is not a string.',
    file: 'OwlOrganization.schema.json',
    termLabel: 'JSON-LD side',
    propLabel: 'JSON Schema side',
    termNote: '@type: "@id" reads the string as an IRI instead of text. @container: "@set" keeps the value an array across the round trip to RDF.',
    propNote: 'x-oold-range again, as on works_for in episode 3: the allowed target schema.',
    instanceLabel: 'in the instance',
    instanceCode: '"employee": ["ex:alice"]',
    statement: 'A property whose range is references only may be written as a bare IRI string, and where it is, its term must carry @type: "@id".',
    source: 'OO-LD specification, Schema Instances',
  },

  graph: {
    kicker: 'the graph',
    title: 'Two documents. One graph.',
    leftFile: 'OwlOrganization.instance.json',
    rightFile: 'RdfPerson.instance.json',
    edge: 'schema:employee',
    nodes: [
      { id: 'ex:acme', type: 'schema:Organization' },
      { id: 'ex:alice', type: 'schema:Person' },
    ],
    note: 'Nothing joined them but the IRI. Each document was written on its own.',
    statement: 'OO-LD-aware tooling resolves the IRIs it references into linked objects, so a stored graph can be navigated as objects.',
    source: 'OO-LD guide, Introduction',
  },

  version: {
    kicker: 'identification and versioning',
    title: 'Which schema, and which version of it.',
    schemaLabel: 'the schema identifies itself',
    schemaPoints: [
      '$id, the global unique identifier',
      'x-oold-uuid, stable across a move between hosts or paths',
    ],
    locationLabel: 'the version lives in the location',
    locations: [
      'appended after the schema name',
      'prepended as a package version, which is the recommendation',
      'or a release tag on a code hosting service',
    ],
    instanceLabel: 'the instance pins one of them',
    note: 'Instances should always reference a versioned schema URL, so it is unambiguous which version they conform to.',
    source: 'OO-LD guide, Identification and Versioning',
  },

  base: {
    title: 'A bare file name is a relative URI.',
    baseLabel: 'fetched from',
    note: 'Every bare file name in this series resolves against the address its own document was fetched from. Inside a package, that address carries the version.',
    source: 'OO-LD specification, Identification and Versioning',
  },

  close: {
    kicker: 'episode 4',
    title: 'Identity is what makes it a graph.',
    recap: [
      { term: '@id', text: 'names the entity' },
      { term: '@context', text: 'projects it to triples' },
      { term: '@type: "@id"', text: 'turns a field into a reference' },
    ],
    claim: 'OO-LD schemas allow generic ex- and import of RDF.',
    source: 'OO-LD guide, Introduction',
    nextKicker: 'Episode 5',
    next: ['All of this from Python.'],
  },
};

// examples/RdfPerson.schema.json, without the meta $schema and x-oold-sssom
// annotation members.
export const rdfPersonSchema = `{
  "$id": "RdfPerson.schema.json",
  "@context": {
    "id": "@id",
    "type": "@type",
    "ex": "https://example.org/",
    "schema": "http://schema.org/",
    "name": "schema:name"
  },
  "title": "Person",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "type": { "type": "string", "const": "schema:Person" },
    "name": { "type": "string" }
  }
}`;

export const rdfPersonSchemaContextLines = [3, 4, 5, 6, 7, 8, 9];

// examples/RdfPerson.instance.json, verbatim.
export const rdfPersonInstance = `{
  "$schema": "RdfPerson.schema.json",
  "@context": "RdfPerson.schema.json",
  "id": "ex:alice",
  "type": "schema:Person",
  "name": "Alice"
}`;

// examples/OwlOrganization.instance.json, verbatim.
export const owlOrganizationInstance = `{
  "$schema": "OwlOrganization.schema.json",
  "@context": "OwlOrganization.schema.json",
  "id": "ex:acme",
  "type": "schema:Organization",
  "employee": ["ex:alice"]
}`;

// jsonld.expand(RdfPerson.instance.json), one node object.
export const rdfPersonExpanded = `[
  {
    "@id": "https://example.org/alice",
    "@type": ["http://schema.org/Person"],
    "http://schema.org/name": [
      { "@value": "Alice" }
    ]
  }
]`;

// jsonld.toRDF(RdfPerson.instance.json), as N-Triples.
export const rdfPersonTriples: [string, string, string][] = [
  ['<https://example.org/alice>', '<http://schema.org/name>', '"Alice"'],
  [
    '<https://example.org/alice>',
    '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
    '<http://schema.org/Person>',
  ],
];

// jsonld.toRDF(OwlOrganization.instance.json), as N-Triples.
export const owlOrganizationTriples: [string, string, string][] = [
  [
    '<https://example.org/acme>',
    '<http://schema.org/employee>',
    '<https://example.org/alice>',
  ],
  [
    '<https://example.org/acme>',
    '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
    '<http://schema.org/Organization>',
  ],
];

// The employee term of examples/OwlOrganization.schema.json, one member per line.
export const employeeTerm = `"employee": {
  "@id": "schema:employee",
  "@type": "@id",
  "@container": "@set"
}`;

// The employee property of examples/OwlOrganization.schema.json.
export const employeeProperty = `"employee": {
  "type": "array",
  "items": {
    "type": "string",
    "format": "iri-reference",
    "x-oold-range": "RdfPerson.schema.json"
  }
}`;

// Specification, Identification and Versioning.
export const schemaIdentity = `{
  "$id": "https://example.org/Foo.schema.json",
  "x-oold-uuid": "b5203131-7321-46bb-8a11-acb3d1015840",
  "title": "Foo"
}`;

// Guide, Schema Instances.
export const versionedInstance = `{
  "@context": "https://example.org/my-package/1.0.0/Person.schema.json",
  "$schema": "https://example.org/my-package/1.0.0/Person.schema.json"
}`;

// Specification, Identification and Versioning: "Relative $ref inside a
// package". The base the two documents are fetched from, the schema as it is
// written inside the package, and what it expands to. The $ref of the expanded
// form is broken onto its own line; nothing else differs from the source.
export const packageBase = 'https://raw.githubusercontent.com/MyOrg/my-package/refs/tags/2.0.0/';

export const relativeSchema = `{
  "$id": "B.schema.json",
  "title": "Foo",
  "allOf": [ { "$ref": "A.schema.json" } ]
}`;

export const resolvedSchema = `{
  "$id": "https://raw.githubusercontent.com/MyOrg/my-package/refs/tags/2.0.0/B.schema.json",
  "title": "Foo",
  "allOf": [
    { "$ref": "https://raw.githubusercontent.com/MyOrg/my-package/refs/tags/2.0.0/A.schema.json" }
  ]
}`;
