# Changelog

Dated entries, no version numbers. The video is not versioned; this file records what changed in the story and why, and git history is the authority.

## 2026-09-14

First cut. 90 seconds, English, silent, light and dark.

- Structure follows the 10 Sept 2026 storytelling workshop: Hook, Clarity, Mechanism, Domains, Proof.
- Clarity line: "OO-LD closes the gap between data a machine can check and data a human can understand." Synthesised from the workshop drafts and **not yet ratified by the team**.
- Hook is a 3x3 matrix: one row per domain, the same field spelled three ways in each row.
- Domains: government forms, research data, manufacturing.
- Facts on the end card are deliberately evergreen so the video does not rot. It says "Open specification" rather than naming a release, because `OO-LD/oold-schema` is at v1.0.0-rc.3.
- No funding line on the end card; the funder is already recorded in the repository.

## Pending

- German cut. Translate `src/copy.ts` and render with a `lang` input prop.
- Narration. Prototyped separately and not shipped: the on-screen prose already carries the script, so a voice track competes with it rather than adding to it. Making that work means moving prose off the slides in a voiced mode, not layering audio onto this cut.
