# Governance

How decisions are made, written down at the point where the specification reaches 1.0.0 and the answer starts to matter to people outside the project.

## Scope

This document governs the specification in this repository and the implementations the project maintains. It does not govern schemas other people publish.

## Who decides

The maintainers in [MAINTAINERS.md](MAINTAINERS.md). Decisions are made in the open, in issues and pull requests, and a decision that is not written there did not happen. Where maintainers disagree, the specification lead decides and records the reasoning in the issue.

This is the honest description of a three-person project, not an aspiration. A steering committee including the projects that build on OO-LD is planned; until it exists, saying that it exists would be worse than admitting it does not.

## Changing the specification

Every normative statement carries a permanent identifier. `meta/RULES.md` governs their lifecycle, and the rules there are binding on maintainers, not advisory:

- an identifier is never reused and never silently repointed at a different requirement
- a withdrawn requirement is marked deprecated, never deleted
- the text of each statement is hashed, so a reword that changes what it demands fails the build rather than passing quietly
- `area`, `level` and `applies_to` are frozen against the most recent release; changing one means deprecating the rule and minting a replacement

A change to normative text goes through a pull request. Editorial changes, examples and prose outside a marked sentence do not need a new identifier; a change to what a requirement demands does.

## Releases

Semantic versioning. Within 1.x a release may add requirements, tighten ambiguous prose and correct defects; it does not remove an identifier or change what an existing one means. A change that would do either belongs in a new major version.

The procedure is in [docs/contributing.md](docs/contributing.md). Release notes state what breaks, and a release that breaks something carries an entry in [docs/guide/upgrading.md](docs/guide/upgrading.md).

## Conformance

The [rule catalogue](https://oo-ld.org/latest/rules/) marks which statements bind a document and which bind an implementation. A conformance programme, including what an implementation must demonstrate and how, does not exist yet. The gap between the rules an implementation is held to and what any implementation demonstrably does is real, and the specification's status section says so rather than implying otherwise.

## Contributing

[docs/contributing.md](docs/contributing.md) covers what a contribution has to satisfy. Conduct is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Licensing

The specification is CC0. The implementations are Apache-2.0. A contribution is accepted under the licence of the repository it lands in.
