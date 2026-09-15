# OO-LD tutorial series - production brief

Five episodes, each standing on the one before it, from first principles to the Python library. Silent, text on screen, 1920x1080 at 30fps. Same visual system throughout: the series has to read as one thing, not five.

## The arc

| Episode | Dir | Composition id | Question it answers |
|---------|-----|----------------|---------------------|
| 1 | `ep1` | `Ep1Principles` | Why does data need meaning attached to it, and why is a schema alone not enough? |
| 2 | `ep2` | `Ep2Anatomy` | What is actually inside one OO-LD document? |
| 3 | `ep3` | `Ep3Composition` | How do you build bigger objects out of smaller ones? |
| 4 | `ep4` | `Ep4Graph` | How do instances get identity, and how does a set of documents become a graph? |
| 5 | `ep5` | `Ep5Python` | How do I do all of this from Python? |

Each episode assumes its predecessors and must not re-teach them. Open by naming what the viewer already has; close by naming what the next episode picks up.

## Hard rules

**Length.** Max 5 minutes, which is 9000 frames. Aim for 2.5 to 4 minutes. A short episode that lands beats a long one that drifts. Export `DURATION` from `src/Episode.tsx`.

**No invented facts.** Every keyword, file name, URL, API call and output shown on screen must exist in the resources listed for your episode. Read them. If you want to show code, copy real code. An invented `oold.something()` is the worst failure mode available to you and a reviewer will catch it.

**Visual system.** Import from `../../shared`: `theme.ts` (colours, type scale, fonts, `OVERLAP`), `components/Stage.tsx`, `components/Type.tsx`, `components/CodeBlock.tsx`, `components/Icons.tsx`, `lib/motion.ts`. Do not redefine colours, type sizes or fonts, and do not add a font. `Stage` already centres both axes; code blocks and field lists stay left-aligned inside their card.

**Icon meanings are fixed** across the series. `IconOOLD` amber = an OO-LD document. `IconValidate` blue = JSON Schema, structure, validation. `IconGraph` purple = JSON-LD, meaning, links. `IconCode` green = code and codegen. `IconDoc` red = documents, forms, UI. `IconStore` orange = storage, databases, APIs. Never use one for something else.

**Scene structure.** One `Sequence` per scene inside a `Fill`, scene durations in one array so retiming is one edit, `sceneOpacity(frame, duration)` plus `durationInFrames={duration + OVERLAP}` for the cross-dissolve. `media/explainer/src/Explainer.tsx` in the oold-schema clone is the reference shape.

**Text.** No long dashes, no double dashes, no emojis, no icons in text. Write "JSON Schema" and "JSON-LD" exactly. Keep all on-screen strings in `src/copy.ts` so a translation is a file, not a rewrite. Nothing on screen for under 2 seconds. Nothing wider than the safe area.

**beats.json.** `src/beats.json` is a list of `{"name": "NN-slug", "frame": N}`, one per beat you want reviewed, covering every scene. This is what gets rendered for review, so if a beat is missing it does not get looked at.

## Commands

From the tutorials directory:

```bash
node epN/scripts/stills.mjs          # all beats to epN/out/stills/
node epN/scripts/stills.mjs slug     # only matching beats
npx tsc --noEmit -p tsconfig.json    # typecheck the whole series
node epN/scripts/render.mjs          # full mp4, slow, leave to the director
```

Each episode renders from its own directory, so several can run at once.

## Write access

Only inside your own `tutorials/epN/`. Everything else, including the shared directory and both repository clones, is read-only.
