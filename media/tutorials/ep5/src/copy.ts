// Every on-screen string for episode 5, so a translation is a file and not a
// rewrite. Code blocks are copied from the oold-python sources listed next to
// each one; nothing here is paraphrased API.
//
// Reworked against oold-python v1.0.0 (clone at C:/tmp/oold-python, tag
// v1.0.0, CHANGELOG "## v1.0.0 (2026-09-15)"). What moved since the 0.20.0
// cut of this episode:
//
//   - Link[T] / LinkList[T] with OoldField() are new, and are the declaration
//     a type checker reads in both directions. The plain annotation plus a
//     range extra is unchanged, still supported, and still what the generator
//     emits, so both forms are on screen and neither replaces the other.
//   - The binding is per-field descriptors. Reading a link returns the real
//     resolved object, a to-many link resolves in one backend call, and the
//     result is cached in the instance __dict__.
//   - LocalSparqlResolver.query is implemented now: the query DSL is
//     translated to SPARQL rather than raising. The backend table says so.
//   - Validation is untouched. Every string in the validate scene was
//     re-checked against src/oold/validation at v1.0.0 and none of it moved:
//     the check id and rule id pair, the message f-string, the CLI line
//     layout, the Options fields and the Report accessors are all where the
//     0.20.0 cut of this episode found them.
//
// Where docs/ and src/ disagree, src/ wins: docs/get-started.md and
// docs/how-to/codegen.md still show an `oold.model.model` module that the
// package does not contain, and docs/how-to/rdf-export.md shows a compacted
// to_jsonld() result that export_jsonld() does not produce.
//
// The whole episode is one Person, and it is the Person of episodes 1 to 4:
// oold-schema examples/RdfPerson.schema.json, with `ex: https://example.org/`
// and `schema: http://schema.org/` unchanged, plus the `knows` term and
// property this episode needs. So `ex:alice` expands to
// https://example.org/alice and `schema:Person` to http://schema.org/Person,
// which is what episode 4 expanded by hand.

export const copy = {
  open: {
    kicker: 'Episode 5 of 5',
    recall: ['You can read', 'an OO-LD document.'],
    recallSub: 'Shape and meaning in one file, composed, and carrying identity.',
    question: ['How do I do all of this', 'from Python?'],
    questionSub: 'Everything from here on is the oold library, exactly as it ships.',
    installLead: 'Install the library.',
    installSub: 'Python 3.10 or later. The library is on PyPI as oold, at version 1.0.0.',
  },

  // First, because nothing after it is worth doing to a document that is
  // quietly wrong. The scene opens on the failure episode 1 described, then
  // shows the command that finds it.
  validate: {
    kicker: 'Check it first',
    modesLead: 'Two ways a property loses its meaning',
    // docs/how-to/validation.md, "Why more than JSON Schema", the two rows of
    // its table, and README.md, Validation.
    modes: [
      {
        name: 'Dropped',
        text: 'The term has no @context definition, so the key vanishes on expansion.',
      },
      {
        name: 'Suspicious',
        text: 'The term maps through a prefix that was never defined. The key survives and means nothing.',
      },
    ],
    modesSub: 'Neither is a JSON Schema error. Neither is a JSON-LD error.',
    cliLead: 'One command, over a file or a directory.',
    cliSub:
      'A single file is classified by its $schema. A directory runs every schema and instance it contains.',
    libLead: 'Or from Python, with the report as data.',
    libSub:
      'Every entry point returns a Report rather than raising, so a caller asking about a broken document gets the explanation instead of a traceback.',
    findingLead: 'A failure names the rule it broke.',
    // The four fields of one real `oold validate --verbose` failure over the
    // personSchema document below with "@container": "@set" deleted from knows.
    // Re-checked at v1.0.0: the rule id and check id are the pair in
    // check_registry.py:927-932, the message is the f-string at
    // pipeline.py:276-283, and the URL is SPEC_RULE_URL + rule, cli.py:31
    // and :161.
    //
    // The frame sets them one per line. The terminal puts the first three and
    // the message on one line (cli.py:159) and the URL on the next, which is
    // about 120 columns and does not fit the safe area at a legible mono size,
    // so the card is drawn as a flush-left extract of the four fields rather
    // than as a transcript: no prompt, no indent, nothing claiming to be a copy
    // of what the terminal drew.
    //
    // That run reports a second failure too, roundtrip.generated, whose message
    // carries a randomly generated example value and so is not reproducible on
    // screen; findingNote is worded so it does not claim this is the only line.
    finding: {
      verdict: 'FAIL',
      rule: 'OOLD-RT-08f2',
      check: 'lint.container',
      message:
        'Person.schema.json: strict array property without @container @set/@list: knows',
      link: 'https://oo-ld.org/latest/spec/#rule-OOLD-RT-08f2',
    },
    findingNote: 'Drop @container @set from knows, and lint.container fails with this.',
    ci: 'Exit code is 0 only when no check failed and none faulted. Warnings do not fail a run.',
    uvxLabel: 'No install needed',
  },

  model: {
    kicker: 'The class, by hand',
    contextLead: 'The context rides in model_config.',
    // Episodes 2 to 4 read @context out of a document; what is new is where it
    // sits in Python, not what it does. architecture.md, Model Core: "JSON-LD
    // context injection via json_schema_extra".
    contextSub:
      'Episodes 2 to 4 read this block out of a file. In Python it rides in json_schema_extra, and the serialiser reads it from there.',
    fieldsLead: 'A link is an ordinary field.',
    fieldsSub:
      'range is what turns knows into a reference: the serialiser writes the IRI of the other Person, not a nested copy of it. This is the shape code generation emits, and it keeps working unchanged.',
    linkLead: 'Or declare the link in the type.',
    linkSub:
      'Link[T] reads as T, so a chain needs no guard at every hop. Link[T | None] reads as T | None, because absence is then part of the model.',
    newBadge: 'New in 1.0.0',
    compareLead: 'Two spellings of the same field',
    compareHead: ['', 'range keyword', 'Link[T] / LinkList[T]'],
    // docs/design/graph-object-binding.md 3.3, "Which notation supports what",
    // rows 1 and 4 of that table, column by column: "target inferred", "read
    // type", "IRI write typed", "optionality declarable", "range keyword in
    // schema" and "codegen emits it".
    compare: [
      ['Target of the link', 'named a second time', 'inferred from the annotation'],
      ['Read type', 'list[T] | None', 'exact'],
      ['Assigning an IRI', 'not typed', 'typed'],
      ['Optionality', 'not declarable', 'declared'],
      ['Keyword in the schema', 'range, still read', 'x-oold-range, derived'],
      ['Code generation emits it', 'yes', 'not yet'],
    ],
    // The same doc's preamble to that table, which is also the limit of the
    // claim: "Every row is the same field at runtime - they resolve, batch,
    // serialise and query identically. They differ in what a type checker sees
    // and what reaches the JSON Schema." So the schema is the one thing that is
    // not the same, and it is a row of the table rather than part of this line.
    compareSub:
      'The same field at runtime: same resolution, same batching, same queries. Nothing existing needs rewriting.',
  },

  bind: {
    kicker: 'A link is the object',
    fillLead: 'One field, two ways to fill it.',
    fillSub:
      'Episode 4 turned a field into a reference with @type @id. Here that reference is either the object itself or its IRI, in the same list.',
    realLead: 'Reading it gives the real object.',
    realSub:
      'Not a proxy and not a handle to unwrap. The declared type is what you get, so the value passes anywhere that type is expected.',
    lazyLead: 'And nothing loads until you reach it.',
    lazySub:
      'Only the entities you actually access are fetched, so the graph behind the store can be much larger than the part you hold.',
    batchLead: 'A list resolves in one call.',
    batchSub:
      'One backend call per IRI prefix for the whole list, and the result is cached on the instance, so every read after the first is a plain attribute lookup.',
    walkLead: 'Which is what makes a walk readable.',
    walkSub:
      'A link declared mandatory raises LinkNotResolved when it is unset or when the backend cannot place the reference, so one try and except covers a whole walk.',
  },

  jsonld: {
    kicker: 'Back out as JSON-LD',
    callLead: 'Every instance serialises itself.',
    callSub:
      'to_jsonld is defined on the base class, so the class you wrote and the class the generator writes both have it.',
    outputLead: 'What comes back is expanded JSON-LD.',
    outputSub:
      'The same IRIs episode 4 expanded by hand, now printed by the library: jsonld.expand applied the context, and no @context comes back with it.',
    sparqlLead: 'Which drops straight into rdflib.',
    sparqlSub: 'From Python objects to a queryable graph without leaving the process.',
  },

  codegen: {
    kicker: 'Schema in, class out',
    experimental: 'Experimental',
    schemaLead: 'Start from the Person of episode 4.',
    // Episodes 2, 3 and 4 all taught x-oold-range for this job, and the
    // generator reads bare `range` (src/oold/generator.py:165-194). Said once,
    // here, where range appears in a document.
    schemaSub:
      'Shape in properties, meaning in @context. On knows, range does what x-oold-range did in episodes 2 to 4. x-oold-range is the spec keyword, and the generator reads the bare range.',
    generateLead: 'Hand it to the generator.',
    generateSub:
      'Generator writes one Python file of Pydantic classes that inherit LinkedBaseModel, through datamodel-code-generator.',
    useLead: 'Then import what it wrote.',
    useSub: 'Commit the generated file so downstream imports stay stable.',
    caveatLead: 'Why the label',
    // docs/design/graph-object-binding.md, table at the top and sections 6 and
    // 8, and docs/architecture.md, Code Generator.
    caveats: [
      'It emits the range form, not Link[T] or LinkList[T].',
      'It patches datamodel-code-generator and repairs its output as text.',
      'An IR-based replacement exists only as a spike, in oold.experimental.',
    ],
  },

  // Last of the technical scenes. The document is checked, the objects work,
  // and this is the language that asks them a question.
  query: {
    kicker: 'Ask the graph',
    experimental: 'Experimental',
    subscriptLead: 'The class itself is the lookup.',
    // The three __getitem__ overloads, src/oold/model/_descriptor.py:511-519,
    // and the return shapes of oold_query, :1211-1240.
    subscriptSub:
      'One IRI gives one instance or None. A list of IRIs or a condition gives a LinkResultList, and None when nothing matched.',
    conditionLead: 'A comparison builds an object, not a string.',
    // FieldProxy's comparison operators, _descriptor.py:439-454, build a
    // Condition (backend/interface.py:69-82); & builds a Query out of two of
    // them. examples/notation_example.py:143-145 asserts condition.field.
    conditionSub:
      'Python syntax, and what it produces is data the backend can read. Two of them combine with &, which binds tighter than ==, so each comparison keeps its brackets.',
    listLead: 'The same condition filters a list you hold.',
    listSub:
      'A to-many link is a LinkResultList: an IRI picks one element out of it, a condition filters it, and an attribute name projects across it.',
    sparqlLead: 'And it reaches the store.',
    sparqlSub:
      'SparqlResolver, LocalSparqlResolver and WikiDataSparqlResolver translate the same condition into SPARQL, so the store answers it rather than a list you already loaded.',
    // docs/how-to/backends.md:136 for the translated set, and
    // docs/design/graph-object-binding.md 3.5, last paragraph, for the gaps.
    // The operators sit on their own mono line, because Inter draws lt and le
    // with a lowercase l that reads as a capital I.
    limitsLead: 'What it carries, and what it does not.',
    // _translate raises NotImplementedError on an operator it has no pattern
    // for, src/oold/backend/sparql.py:270-272.
    limitsSub:
      'An operator it cannot translate raises NotImplementedError, so a query either means what it says or fails out loud.',
    limits: [
      {
        name: 'Translated',
        code: 'eq  ne  lt  le  gt  ge  &',
        text: 'Anything else raises rather than returning the wrong rows.',
      },
      {
        name: 'Missing',
        code: '|   ~',
        text: 'No or, no not, and a link field carries only == and !=, never the ordering operators.',
      },
    ],
    tableLead: 'Stores that ship with the library',
    tableHead: ['Backend', 'Storage', 'How you query it'],
    // Storage column: docs/how-to/backends.md:27, :85 and :104. Third column
    // read off the code at v1.0.0: SimpleDictDocumentStore.query filters by
    // field (document_store.py:102-109), SqliteDocumentStore.query raises
    // NotImplementedError (:181-182), and LocalSparqlBackend inherits
    // LocalSparqlResolver.query, which translates the DSL and runs it on its
    // own rdflib graph (sparql.py:43-55). That last row is what changed since
    // 0.20.0, where it raised.
    table: [
      ['SimpleDictDocumentStore', 'In-memory dict, optional JSON file', 'query() filters by field'],
      ['SqliteDocumentStore', 'SQLite database', 'query() not implemented'],
      ['LocalSparqlBackend', 'In-memory RDF graph (rdflib)', 'the DSL, translated to SPARQL'],
    ],
    tableSub: 'Custom backends implement resolve_iris and store_json_dicts.',
  },

  close: {
    kicker: 'That is the series',
    seriesLead: 'Five episodes',
    series: [
      'Why a schema alone is not enough',
      'What is inside one OO-LD document',
      'How bigger objects are built from smaller ones',
      'How instances get identity and become a graph',
      'How to do all of it from Python',
    ],
    tie: 'One document carries the shape and the meaning, and oold turns it into Python objects whose links are the other objects.',
    nextKicker: 'OO-LD',
    next: ['Where to go next'],
    links: [
      { label: 'Documentation', url: 'OO-LD.github.io/oold-python' },
      { label: 'Source', url: 'github.com/OO-LD/oold-python' },
      { label: 'Package', url: 'pypi.org/project/oold' },
      { label: 'Playground', url: 'oo-ld.github.io/playground-python-yaml' },
    ],
    sign: 'uv add oold',
  },
};

// ---------------------------------------------------------------- code blocks

// docs/get-started.md, Installation
export const installShell = `uv add oold

pip install oold`;

// docs/get-started.md, Verify the installation
export const verifyShell = `python -c "import oold; print(oold.__version__)"`;

// -------------------------------------------------------------- validation

// The three forms of docs/how-to/validation.md, CLI, on this episode's own
// file names; the extra is README.md, Validation. The middle line is the same
// run as the `oold validate-instance` the docs list beside it: a file whose
// $schema names a schema rather than a meta-schema is classified as an
// instance and handed to validate_instance.
export const validateShell = `pip install "oold[validation]"

oold validate Person.schema.json
oold validate Person.instance.json
oold validate ./schemas/`;

// oold-schema docs/tooling.md, General workflow, verbatim. The `validation`
// extra it names is pyproject.toml:55.
export const uvxShell = `uvx --from "oold[validation]" oold validate path/to/schemas`;

// Names checked against src/oold/validation/__init__.py __all__, the Options
// dataclass at pipeline.py:54-66, the validate_schema / validate_instance
// signatures at pipeline.py:745 and :778, and Report.failures / Check.rule|id|
// target|message in report.py. All unchanged at v1.0.0.
export const validateLibPy = `from oold.validation import Options, validate_instance, validate_schema

options = Options(meta=("latest",), offline=True)

for report in (
    validate_schema("Person.schema.json", options),
    validate_instance("Person.instance.json", options=options),
):
    for check in report.failures():
        print(check.rule, check.id, check.target, check.message)`;

// ------------------------------------------------------- the class, by hand

// tests/test_rdf.py:87-110, the pydantic v2 Person, flattened into one class
// and moved onto this episode's namespaces. @container @set on knows is from
// tests/test_rdf.py:98 and is what lint.container asks for.
export const modelPy = `from oold.model import LinkedBaseModel
from pydantic import ConfigDict, Field

class Person(LinkedBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "@context": {
                "id": "@id", "type": "@type", "name": "schema:name",
                "ex": "https://example.org/",
                "schema": "http://schema.org/",
                "knows": {"@id": "schema:knows", "@type": "@id", "@container": "@set"},
            },
            "$id": "https://example.org/Person.schema.json",
        }
    )`;

export const modelContextLines = [7, 8, 9, 10, 11, 12];

// The declaration shape src/oold/model/_descriptor.py documents in its module
// docstring, lines 5-13, and the one the generator emits. At v1.0.0 the
// descriptor binding scans model_fields for `x-oold-range` or legacy `range`
// (_descriptor.py:1310) and installs a link descriptor for each, so this class
// binds exactly as the Link[T] one below does. The range value is a class IRI,
// as in tests/test_rdf.py:108.
//
// `name` carries a default, as every generated data field does
// (tests/data/quantities/model.py:68-72, where the generator wrote
// `id: str | None = None` and `prop2: str | None = None`), so the class on
// screen here is the one the constructors in the binding scene actually build.
export const fieldsPy = `class Person(LinkedBaseModel):
    model_config = ConfigDict(json_schema_extra={...})

    id: str
    type: str = "schema:Person"
    name: str | None = None
    knows: list["Person"] | None = Field(
        None, json_schema_extra={"range": "schema:Person"}
    )`;

// README.md, Object Graph Mapping, and docs/how-to/object-graph-mapping.md,
// "Recommended declaration" and "Optionality is declared". father / mother are
// that doc's own pair; the constructor line and the comment on the read are
// README.md:134-135. model_rebuild() is what examples/wiki_data.py:86 and
// examples/notation_example.py:61 both call after a class with forward
// references.
export const linkPy = `from oold.model import Link, LinkedBaseModel, LinkList, OoldField

class Person(LinkedBaseModel):
    id: str
    name: str | None = None
    knows: LinkList["Person"] = OoldField()
    father: Link["Person"] = OoldField()          # promises a Person
    mother: Link["Person | None"] = OoldField()   # may legitimately be absent

Person.model_rebuild()

alice = Person(id="ex:alice", knows=["ex:bob", {"id": "ex:carol"}])
alice.knows[0].name    # a Person, resolved on access`;

// ------------------------------------------------------------- the binding

// docs/how-to/object-graph-mapping.md, "IRI string assignment and lazy
// resolution" for the store and the resolver registration, and "Mixing objects
// and IRIs" for the last line, which that doc writes as
// `tags=[python_tag, "ex:tag-async"],  # one object, one IRI`.
export const bindFillPy = `from oold.backend.document_store import SimpleDictDocumentStore
from oold.backend.interface import SetResolverParam, StoreParam, set_resolver

store = SimpleDictDocumentStore()
set_resolver(SetResolverParam(iri="ex", resolver=store))

bob   = Person(id="ex:bob",   name="Bob")
carol = Person(id="ex:carol", name="Carol")
store.store(StoreParam(nodes={"ex:bob": bob, "ex:carol": carol}))

alice = Person(id="ex:alice", knows=[bob, "ex:carol"])   # object or IRI`;

// examples/notation_example.py:92-95, which asserts both lines and carries the
// "a real Person, not a proxy" comment verbatim. _descriptor.py's module
// docstring states the same guarantee: "reading a link returns the real
// resolved object (isinstance holds)".
export const bindRealPy = `carol = alice.knows[1]

carol.name                  # Carol
isinstance(carol, Person)   # True - a real Person, not a proxy`;

// examples/notation_example.py:86 for the constructor and :141 for link_iris,
// which that file asserts and annotates "inspect without resolving".
// link_iris is _compat.py:189, "The stored reference(s) for one link, without
// resolving".
export const bindLazyPy = `alice = Person(id="ex:alice", knows=["ex:bob", "ex:carol"])

alice.link_iris("knows")   # the stored IRIs, nothing fetched yet
alice.knows[0].name        # Bob, fetched on this line`;

// _AutoLink.__get__ for a to-many link calls _batch_resolve over the whole
// stored list (_descriptor.py:976) and then writes the result into the
// instance __dict__ (:1003), which shadows the non-data descriptor.
// _batch_resolve's own docstring: "Resolve all unresolved refs, one backend
// call per resolver prefix".
export const bindBatchPy = `alice.knows            # one backend call for both, not one each

alice.knows[0].name    # Bob
alice.knows[1].name    # Carol, already here, no second call`;

// docs/how-to/object-graph-mapping.md, "Optionality is declared": the chain
// line and the try / except block are that section verbatim, on this episode's
// own names. examples/wiki_data.py:113-127 runs the same walk against a live
// endpoint.
export const bindWalkPy = `from oold.model import LinkNotResolved

person.father.father.father.name   # no guard at any hop

try:
    while True:
        person = person.father
        print(person.name)
except LinkNotResolved:
    print("ancestry ends here")`;

// -------------------------------------------------------------- back to RDF

// tests/test_rdf.py:111-114, which builds p2 knowing p1 and calls
// print(p2.to_jsonld()); json.dumps only widens the dict repr into the shape
// the next block shows. to_jsonld returns a dict (_compat.py:270-272).
export const jsonldCallPy = `import json

bob = Person(id="ex:bob", name="Bob", knows=[alice])

print(json.dumps(bob.to_jsonld(), indent=2))`;

// Captured output. The IRIs are the ones episode 4 expanded by hand from
// RdfPerson.instance.json: https://example.org/alice and
// http://schema.org/Person.
//
// Not what docs/how-to/rdf-export.md:46-60 and docs/get-started.md:95-101
// show: both print a compacted document, which no code path produces.
// to_jsonld() (src/oold/model/_compat.py:270-271) delegates to export_jsonld
// (src/oold/static.py:404-427), and there is no jsonld.compact between the
// input dict and the return, only jsonld.expand.
export const jsonldOutput = `{
  "@id": "https://example.org/bob",
  "http://schema.org/knows": [
    {
      "@id": "https://example.org/alice"
    }
  ],
  "http://schema.org/name": [
    {
      "@value": "Bob"
    }
  ],
  "@type": [
    "http://schema.org/Person"
  ]
}`;

// README.md, RDF-Export, and tests/test_rdf.py, which asserts the result. The
// predicate IRIs are this episode's schema prefix, http://schema.org/, so the
// query is the one that matches the output above.
export const sparqlPy = `from rdflib import Graph

g = Graph()
g.parse(data=alice.to_jsonld(), format="json-ld")
g.parse(data=bob.to_jsonld(), format="json-ld")

qres = g.query("""
    SELECT ?name
    WHERE {
        ?s <http://schema.org/knows> ?o .
        ?o <http://schema.org/name> ?name .
    }
""")
for row in qres:
    print("Bob knows", row.name)   # Bob knows Alice`;

export const sparqlQuoteLines = [8, 9, 10, 11, 12];

// ---------------------------------------------------------- code generation

// oold-schema examples/RdfPerson.schema.json, extended with the `knows` term
// and property: same $schema, same ex/schema prefixes, same title, same id /
// type / name properties. `type` carries a default rather than RdfPerson's
// const so the generated class registers it (get_cls_iri); the value,
// schema:Person, is unchanged. Context entries are paired onto one line each
// to fit the frame.
//
// $schema is what lets the CLI classify the file at all, $id is required by
// schema.meta and rule.id (OOLD-VER-3b96), and `title` is what names the
// generated class: without it datamodel-code-generator writes `class Model`.
export const personSchema = `{
  "$schema": "https://oo-ld.org/latest/meta/oold-meta-schema.json",
  "$id": "https://example.org/Person.schema.json",
  "title": "Person", "type": "object",
  "@context": {
    "id": "@id", "type": "@type", "name": "schema:name",
    "ex": "https://example.org/", "schema": "http://schema.org/",
    "knows": {"@id": "schema:knows", "@type": "@id", "@container": "@set"}
  },
  "properties": {
    "id": {"type": "string"}, "name": {"type": "string"},
    "type": {"type": "string", "default": "schema:Person"},
    "knows": {"type": "array", "items": {"type": "string", "range": "Person.schema.json"}}
  }
}`;

// Lines 5 to 9 of personSchema are the @context block, drawn in the JSON-LD
// purple against the JSON Schema blue of the rest.
export const schemaContextLines = [5, 6, 7, 8, 9];

// Shape of the call from tests/test_oold.py and the field list of
// Generator.GenerateParams in src/oold/generator.py:16-32. DataModelType is
// imported from datamodel_code_generator, the same way generator.py does.
// Not from docs/get-started.md or docs/how-to/codegen.md: both still import
// `oold.model.model`, a module src/oold/model/ does not contain.
//
// The `id` member is the one generator-only key in the flow and is set here
// rather than in the document on screen, because it is not a JSON Schema
// keyword: src/oold/generator.py:78 reads schema["id"] and writes the schema
// to `<id>.json` in its working directory, which is the name main_schema and
// `range` then refer to.
export const generatePy = `import json
from pathlib import Path
from datamodel_code_generator import DataModelType
from oold.generator import Generator

person_schema = json.loads(Path("Person.schema.json").read_text())
person_schema["id"] = "Person.schema"   # the generator's file name

Generator().generate(Generator.GenerateParams(
    json_schemas=[person_schema],
    main_schema="Person.schema.json",
    output_model_type=DataModelType.PydanticV2BaseModel,
    output_model_path=Path("generated_model.py"),
))`;

// The generated file is imported from where it was written, as
// tests/test_oold.py does with its own output_model_path.
export const usePy = `from generated_model import Person

alice = Person(id="ex:alice", name="Alice")
bob   = Person(id="ex:bob",   name="Bob", knows=[alice])

print(bob.knows[0].name)   # Alice`;

// --------------------------------------------------------------- the query

// The three metaclass __getitem__ overloads, src/oold/model/_descriptor.py:
// 511-519, in the order they are declared. The condition form is the one
// docs/how-to/backends.md:133 and examples/wiki_data.py:130 both write.
export const querySubscriptPy = `Person["ex:alice"]                # one IRI

Person[["ex:alice", "ex:bob"]]    # a list of IRIs

Person[Person.name == "Alice"]    # a condition`;

// FieldProxy.__eq__ returns Condition(field=..., operator="eq", value=...)
// (_descriptor.py:439-440); Condition.__and__ returns
// Query(op1=self, operator="and", op2=other) (backend/interface.py:81-82).
// examples/notation_example.py:143-145 builds the same condition and asserts
// condition.field == "name", with the comment that a type checker reads the
// expression as bool - which is why the __getitem__ overloads accept bool.
export const queryConditionPy = `condition = Person.name == "Alice"

condition.field      # name
condition.operator   # ComparisonOperator.EQ
condition.value      # Alice

Person[(Person.name == "Alice") & (Person.type == "schema:Person")]`;

// LinkResultList, src/oold/model/_descriptor.py:628-805. Its docstring names
// the three: "Adds IRI lookup, filtering and attribute projection". The string
// index matches on id (:783), a Condition filters with apply_operator (:787),
// and __getattr__ projects an attribute across the list (:793).
export const queryListPy = `alice.knows["ex:bob"]               # by IRI

alice.knows[Person.name == "Bob"]   # by condition

alice.knows.name                    # the name of every element`;

// docs/how-to/backends.md:128-133, "Querying a SPARQL backend", verbatim
// except for the import line order. examples/wiki_data.py runs the same two
// lines against the live endpoint.
//
// The comment is on screen because every earlier beat registered `iri="ex"` and
// looked up an `ex:` IRI, which trains the prefix as a route. For a condition it
// is not one: oold_query iterates interface._resolvers.values()
// (_descriptor.py:1219) and skips whatever raises NotImplementedError, so the
// query reaches every registered resolver whatever its key. Its own docstring:
// "Resolve ``Model[...]`` against every registered resolver."
export const querySparqlPy = `from oold.backend.interface import SetResolverParam, set_resolver
from oold.backend.sparql import WikiDataSparqlResolver

# a registry key, not a route: a condition goes to every registered resolver
set_resolver(SetResolverParam(iri="Item", resolver=WikiDataSparqlResolver()))

Person[Person.name == "Tim Berners-Lee"]`;
