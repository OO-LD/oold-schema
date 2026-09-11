# OO-LD explainer video

90 seconds, silent, 1920x1080 at 30fps. Text on screen carries the script, so it works autoplaying muted on a website.

The story follows the structure from the 10 Sept 2026 storytelling workshop: Clarity, Trigger, Proof.

| Scene | Frames | Time | Beat |
|-------|--------|------|------|
| S1 Hook | 0-360 | 0:00-0:12 | Three systems record the same things in three incompatible ways |
| S2 Clarity | 360-750 | 0:12-0:25 | The one sentence |
| S3 Mechanism | 750-1500 | 0:25-0:50 | JSON Schema + JSON-LD in one file, the real minimal schema, five outputs |
| S4 Domains | 1500-2160 | 0:50-1:12 | Government forms, research data, manufacturing |
| S5 Proof | 2160-2700 | 1:12-1:30 | Where we come from, what exists, where to go |

## Versioning

The video carries no version number: nothing on screen, nothing in the filename. Git history is the record of what changed, and `CHANGELOG.md` summarises it by date. A number stamped on the artefact only invites the question of which cut someone is holding, which the commit already answers.

Facts on screen are deliberately evergreen so the video does not rot between cuts. The end card says "Open specification" rather than naming a release, because `OO-LD/oold-schema` is still at v1.0.0-rc.3.

Renders are reproducible across machines: Inter and JetBrains Mono are vendored as latin-subset woff2 in `public/fonts`, and `src/lib/fonts.ts` holds capture until every weight has actually loaded. If a face is ever missing the render aborts rather than silently falling back, so a CI build and a local build produce the same frames. `@rendiv/*` is pinned to an exact version for the same reason; `^0.2.x` would let a patch release change the output.

## Commands

```bash
npm install                  # runs scripts/patch-rendiv.mjs (see below)
npx playwright install chromium

npm run studio               # live preview, timeline scrubbing
npm run check                # example-sync check + typecheck, same as CI
npm run stills               # one PNG per beat into out/stills, for review
npm run stills -- clarity    # only beats whose name contains "clarity"
npm run render               # out/oold-explainer.mp4
```

Individual scenes are registered as their own compositions (`S1`..`S5`), so `npx rendiv studio src/index.tsx` can play one scene in isolation.

## Where things live

- `src/copy.ts` - every string on screen. A German cut is a translation of this file plus a second composition, not a rewrite.
- `src/theme.ts` - palette, type scale, and the scene frame boundaries. Retiming the video is one edit here.
- `src/components/Icons.tsx` - the six brace-wrapped marks, rebuilt as inline SVG from `logo/new_draft.png`. Colors are sampled from that file: `#FBAC13` OO-LD, `#0555AC` validation, `#009933` code, `#5E2FA3` linked data, `#D2000C` documents, `#FF6600` storage. Render the `IconSheet` still to check them against the source.
- `src/components/CodeBlock.tsx` - JSON with keys coloured by group (JSON-LD purple, JSON Schema blue), line-by-line reveal and the highlight sweeps.
- `public/fonts/` - vendored Inter and JetBrains Mono latin subsets, both SIL OFL 1.1, licences alongside.

The JSON in scene 3 is `examples/Minimal.schema.json` from this repo, verbatim. It has to be inlined in `src/copy.ts` because the video bundle cannot read outside its own tree, so `npm run check` asserts the two have not drifted. That check is why the explainer lives in this repo rather than a standalone one.

## CI

`.github/workflows/explainer.yml`, path-filtered so a spec-only change never triggers it.

| Trigger | Does |
|---------|------|
| PR touching `media/explainer/**` or `examples/Minimal.schema.json` | `npm run check`, then renders the 14 beat stills and uploads them as an artifact |
| tag `explainer/v*` | renders and attaches `oold-explainer.mp4` to a GitHub Release |

Stills are the review surface. Nobody reviews a 90 second video in a PR, they look at frames. The mp4 is never committed; the docs site embeds the release asset, so a new cut needs no docs deploy and is not copied into every mike-published spec version.

## The patch

`@rendiv/bundler` 0.2.6 interpolates the absolute entry path into `import '${importPath}'` without normalising it. On Windows the backslashes are read as string escapes, so this project's path (`...\2025-11-26_PrototypeFund\...`) turns `\202` into an octal escape and Rollup cannot resolve the entry. `scripts/patch-rendiv.mjs` normalises the separators; it runs on `postinstall` and is a no-op once upstream fixes it. `@rendiv/studio` already normalises its equivalent path, so `npm run studio` works unpatched.
