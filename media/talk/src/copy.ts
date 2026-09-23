// Every string on screen. A German cut is a translation of this file plus a
// second pair of compositions, not a rewrite.
//
// Names here are what a section is about, not which number it currently has, so
// inserting a segment does not renumber the copy as well as the timeline.
//
// `explain` holds the self-explaining line for each beat, keyed by segment id
// and beat name exactly as src/timeline.json names them. It is the only text
// that differs between the two modes: presentation drops it because the speaker
// says it, the website cut shows it because nobody does.
import type { IconKey } from './components/Icons';

export const mse = {
  eyebrow: 'MSE 2026, Topic D Digital Transformation',
  title: [
    'How GenAI Makes Complex User Interfaces Obsolete,',
    'Thus Overcoming a Major Barrier for Digital',
    'Transformation in Materials Science',
  ],
  speaker: 'Simon Stier',
  affiliation: 'Fraunhofer Institute for Silicate Research ISC',
  venue: 'Materials Science and Engineering Congress',
  place: 'Darmstadt and online, 29 September to 1 October 2026',
  thanks: 'Questions',
};

// Three kinds of claim, and the words for them. The marks keep them apart on
// screen so the talk can make all three without any of them borrowing the
// others' credibility.
export const tiers = {
  built: 'Built',
  underway: 'Under way',
  argue: 'We argue',
};

export const marks = {
  kicker: 'How to read these slides',
  cards: [
    {
      tier: 'built' as const,
      body: 'Specified, implemented and checkable today. You can open it after the talk.',
    },
    {
      tier: 'underway' as const,
      body: 'Public code that is being written. Named repositories, with the status their own authors give them.',
    },
    {
      tier: 'argue' as const,
      body: 'A position on where this is going. Not a feature, and not a measurement.',
    },
  ],
  // Broken by hand: left to wrap, the second line orphans "at." on a line of
  // its own.
  both: [
    'This talk needs all three.',
    'The mark in the corner says',
    'which one you are looking at.',
  ],
};

export const barrier = {
  kicker: 'The barrier',
  paradox: ['The more FAIR we want the data,', 'the more complex the form that collects it.'],
  cost: ['nested fields', 'controlled vocabularies', 'mandatory metadata', 'validation rules'],
  costCaption:
    'Every one of them is a data management requirement. Every one of them is also a question a researcher has to answer.',
  punch: 'Systems fail on usability, not on functionality.',
  punchSub:
    'Well designed laboratory infrastructure has gone unused for a decade, and the feature list was rarely the reason.',
};

export const wall = {
  kicker: 'What the researcher meets',
  formTitle: 'New measurement',
  fields: [
    { label: 'Sample id', note: 'required' },
    { label: 'Material', note: 'vocabulary' },
    { label: 'Process temperature / K', note: 'bounded number' },
    { label: 'Holding time / s', note: 'number' },
    { label: 'Atmosphere', note: 'vocabulary' },
    { label: 'Instrument', note: 'reference' },
    { label: 'Operator', note: 'reference' },
    { label: 'Ontology term for the process', note: 'IRI' },
    { label: 'Related sample', note: 'reference' },
  ],
  formCaption:
    'A researcher trained in materials science. A screen asking for training in data entry.',
  inputs: [
    'a note dictated at the furnace',
    'a photograph of the sample',
    'the spreadsheet the instrument wrote',
  ],
  inputsCaption: 'The same experiment, as it actually got recorded.',
  punch: 'The data exists. The form is what does not get filled in.',
};

export const halves = {
  kicker: 'What a machine needs',
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
  neither: [
    'Structure without meaning is a private format.',
    'Meaning without structure is not checkable.',
  ],
  drift: ['A schema file', 'A context file'],
  driftCaption:
    'Most stacks compile the two out of a third source. Two outputs, one of which is easy to forget.',
};

export const document = {
  kicker: 'OO-LD',
  codeCaption: 'examples/Minimal.schema.json, from the specification repository.',
  washSchema: 'a valid JSON Schema',
  washContext: 'a referenceable JSON-LD context',
  claim: 'The same document is both. Not generated into both.',
  punch: 'The artefact is the source.',
  punchSub: 'No modelling language, no build step, no second file to keep in sync.',
};

export const lever = {
  kicker: 'Why a language model cares',
  contract: ['JSON Schema is the contract', 'structured output interfaces already accept.'],
  pipeIn: ['free text', 'a photograph', 'a table'],
  pipeModel: 'a model, held to the schema',
  pipeOut: [
    { icon: 'validate' as IconKey, label: 'it validates' },
    { icon: 'graph' as IconKey, label: 'it is a graph' },
  ],
  pipeCaption: 'The artefact that constrains the model is the artefact that carries the meaning.',
  pipePunch:
    'So the output is Linked Data the moment it is produced. There is no mapping step left to run.',
  roundtripTitle: 'One observed roundtrip',
  roundtripHead: ['the tool schema', 'what @context says it means', 'what the model returned'],
  roundtripRows: [
    ['"a"', '"schema:familyName"', '"Mustermann"'],
    ['"b"', '"schema:givenName"', '"Max"'],
  ],
  roundtripCaption: 'The fields were filled by their IRIs, not by their order.',
  roundtripCite: 'oo-ld.org, Use Cases: Delivery to OpenAPI, MCP and LLM tooling',
  nolib: 'There is no library on our side of this.',
  nolibSub:
    'oold ships no model and no pipeline. Being usable this way is a property of the format, which is why it holds without anyone adopting anything.',
};

// Two public repositories, described in the words their own READMEs use. The
// status wording is theirs and is not upgraded here: features in work stay
// features in work.
export const underway = {
  kicker: 'Being built on it',
  projects: [
    {
      name: 'osw-chatbot',
      note: 'public repository, no licence declared',
      body: 'Tools to simplify contributing to and interacting with large knowledge graphs and linked data platforms. Reference implementation: OpenSemanticLab.',
      listTitle: 'Features in work',
      list: [
        'RAG and Graph-RAG',
        'a panel UI component that executes client side tool calls',
        'a wrapper for an OpenAI API providing schema based structured output, file based context and web search',
      ],
    },
    {
      name: 'semos-agentura',
      note: 'Apache-2.0, DOI 10.5281/zenodo.20538079',
      body: 'A modular multi-agent system for professional and scientific workflows, built on open protocols: MCP and A2A.',
      listTitle: 'Packages',
      list: ['core', 'document', 'email', 'files', 'ui'],
    },
  ],
  wording: 'Features in work, in their own words.',
  wordingSub:
    "osw-chatbot's third item is the mechanism from the previous slide turned into software, and it names OO-LD in its own description. It is not finished, and neither project says it is.",
  arc: [
    { tier: 'built' as const, text: 'The format property is built.' },
    { tier: 'underway' as const, text: 'The pipeline is being built.' },
    { tier: 'argue' as const, text: 'The workflow is what we argue for.' },
  ],
};

export const inversion = {
  kicker: 'The inversion',
  lanes: [
    {
      label: 'Form driven',
      steps: ['a researcher', 'learns the data model', 'fills the form', 'structured data'],
    },
    {
      label: 'AI driven',
      steps: [
        'a researcher',
        'describes the experiment',
        'a model, held to the schema',
        'structured data',
      ],
    },
  ],
  lanesCaption: 'Same schema. Same validation. Same graph. A different party does the translating.',
  flip: [
    'The system adapts to the researcher,',
    'instead of the researcher adapting to the system.',
  ],
  punch: 'Complex user interfaces stop being the price of admission.',
  punchSub: 'Obsolete in the sense the abstract means it: no longer necessary, still available.',
};

export const unsure = {
  kicker: 'When the system is not sure',
  cards: [
    { when: 'The input is ambiguous', then: 'Ask one targeted question. Do not open the schema.' },
    {
      when: 'The data does not validate',
      then: 'Say what is wrong in the language of the domain, not as an error code.',
    },
    { when: 'No schema covers it', then: 'Propose an extension and send it to an expert.' },
  ],
  written: 'Two of those three are already written down.',
  writtenSub:
    '88 normative rules, each with a permanent id and a one line summary. A validator reports the id it failed, so a domain language explanation has a source text rather than an invention.',
  writtenCite: 'oo-ld.org/latest/rules/',
  punch: 'The schema stays strict. The conversation does not.',
};

export const doors = {
  kicker: 'The form does not go away',
  source: 'one OO-LD schema',
  doors: [
    { label: 'A generated form', sub: 'for the people who want the fields' },
    { label: 'Described in words', sub: 'for the people who want the experiment' },
  ],
  doorsCite: 'Form and view hints are an OO-LD vocabulary: x-oold-ui-*',
  same: 'Same schema. Same validation. Same graph out.',
  sameSub: 'Whoever takes the other door loses no control and no transparency.',
  punch: 'An expert tool, not an entry requirement.',
};

export const cycle = {
  kicker: 'Why this compounds',
  loop: [
    'a lower barrier to structured data',
    'more machine actionable data',
    'models that map it better',
  ],
  loopCaption:
    'The loop only closes if what accumulates is structured. Free text does not compound.',
  punch: 'GenAI is not a convenience here.',
  punchSub:
    'We argue it is the mechanism that resolves the trade between what data management needs and what a researcher will actually do.',
};

export const facts = {
  kicker: 'What exists today',
  items: [
    'Specification v1.0.0-rc.4, CC0',
    '88 normative rules, each with a permanent id',
    '48 of them decidable by a validator',
    'A shared conformance corpus both implementations run',
    'oold on PyPI, Apache-2.0',
    'oold-js, kept in agreement by a parity suite',
  ],
  funding:
    'Funded by the Prototype Fund of the German Federal Ministry of Research, Technology and Space (BMFTR).',
  // No count. tooling.md lists playgrounds under two hosts and a reader could
  // reasonably arrive at a different number, which is a needless thing to be
  // corrected on in a question session.
  checkTitle: 'Browser playgrounds, and the same checks on your own schemas.',
  checkCommand: 'uvx --from "oold[validation]" oold validate <dir>',
  checkSite: 'oo-ld.org',
};

// Named, and nothing more. What either effort is and what it will contain is the
// speaker's to say; "upcoming" is the abstract's own word and the only label
// this deck puts on screen.
export const outlook = {
  kicker: 'Outlook',
  names: [
    { name: 'MaterialsCommons4EU', note: 'upcoming' },
    { name: 'NoE-AImat', note: '' },
  ],
};

export const close = {
  line: 'The schema is the interface.',
  lineSub: 'Whoever, or whatever, fills it in.',
  site: 'oo-ld.org',
  repo: 'github.com/OO-LD',
  licence: 'Specification CC0. Implementations Apache-2.0.',
  funding: 'Funded by the Prototype Fund (BMFTR).',
};

// Keyed by segment id, then by the beat name in src/timeline.json.
export const explain: Record<string, Record<string, string>> = {
  C0: {
    marks:
      'The built claims come from an open specification and two implementations. The others are a status and a position, and they are worth less if they are dressed up as the first.',
    both: 'Mixing them is the point. Keeping them apart on screen is how the mix stays honest.',
  },
  C1: {
    paradox:
      'Structure has to come from somewhere. For two decades it came from the researcher, one field at a time.',
    cost: 'None of this is a mistake. It is what makes a measurement reusable. The cost is that all of it lands on one person.',
    punch: 'This is the premise of the talk. Everything after it follows from taking it seriously.',
  },
  C2: {
    form: 'Nine fields is a modest form. A real sample record carries process parameters, provenance and ontology terms as well.',
    inputs:
      'Unstructured does not mean poor. It means the structure is implicit, and that somebody still has to make it explicit.',
    punch:
      'We argue the bottleneck was never willingness. It was the channel the data had to arrive through.',
  },
  C3: {
    panels: 'A schema says what shape the data has. A context says what its fields mean.',
    neither:
      'A validator cannot tell you that T_degC and temp_celsius are the same quantity. A context cannot tell you that one of them is missing.',
    drift:
      'The two files are correct on the day they are generated. Nothing keeps them correct afterwards.',
  },
  C4: {
    code: 'A JSON Schema document with a top level @context. That is the whole of the idea.',
    wash: 'The same bytes. A JSON Schema validator accepts the file, and a JSON-LD processor resolves it as a remote context.',
    punch: 'This is the core statement of the specification, and the rest of the talk rests on it.',
  },
  C5: {
    contract:
      'Tool use, structured output and Model Context Protocol tool schemas all take a JSON Schema. An OO-LD schema is one.',
    pipe: 'The model is constrained by the schema and grounded by the context in the same handover, because they are one document.',
    roundtrip:
      'One roundtrip, not a benchmark. It shows the context survives the transport and reaches the model as grounding.',
    nolib: 'The honest version of the claim is also the stronger one: nothing has to be adopted for it to hold.',
  },
  C6: {
    projects:
      'Two public repositories. The feature lists on screen are the ones their own READMEs mark as in work.',
    wording:
      'Quoting the status as its authors give it is the point. A wrapper that is being written is not a wrapper that has been measured.',
    arc: 'Three different kinds of claim, kept apart rather than averaged into one.',
  },
  C7: {
    lanes: 'The schema does not move between the two lanes. Only the party doing the translation does.',
    flip: 'We argue this is the change that matters, and that it is available now rather than after another decade of interface work.',
    punch: 'Not obsolete in the sense of deleted. Obsolete in the sense of no longer mandatory.',
  },
  C8: {
    cards:
      'Three moments where a form driven system has to expose its internals, and an AI driven one does not.',
    written:
      'The rule text and its summary are published. An explanation can be generated from them instead of guessed at.',
    punch:
      'Nothing is relaxed to make this work. The rules a form would have enforced are the rules the model is held to.',
  },
  C9: {
    doors: 'The form is generated from the same schema, so it cannot drift from what the model is held to.',
    same: 'Direct schema manipulation stays available to whoever prefers it. It stops being the only way in.',
    punch: 'That is the claim in the title, stated without overreach.',
  },
  C10: {
    loop: 'A knowledge base compounds only if what accumulates is typed and queryable. Prose forces every question to be re-derived.',
    punch:
      'The tension between data quality requirements and researcher adoption has held for over a decade. This is a mechanism that dissolves it rather than trading one side against the other.',
  },
  C11: {
    facts:
      'Both counts come from the generated rule catalogue, which CI diffs byte for byte against a fresh render.',
    funding: 'The specification release and the reference implementation are the funded work.',
    check: 'The same tier of checks this repository runs on its own examples, pointed at yours.',
  },
  C12: {
    mark: 'One document that is both a contract a machine can check and a vocabulary a machine can link.',
    licence: 'Nothing here needs a licence negotiation to reuse.',
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
