# OO-LD talk

A twelve minute conference talk and the generic core inside it. Silent, 1920x1080 at 30fps, speaker-advanced.

The talk was accepted as a lecture at the Materials Science and Engineering Congress (MSE 2026), Topic D Digital Transformation, Darmstadt and online, 29 September to 1 October 2026. The slot is 12 minutes plus 3 minutes of questions.

## Two cuts, two modes, one timeline

| | |
|---|---|
| `Talk` | the conference cut: `M0` title card, the core, `M1` outlook, `M2` acknowledgement |
| `TalkCore` | the same core with nothing naming a conference, a speaker or an institute |
| `M0` .. `M2`, `C0` .. `C12` | one segment on its own, for advancing by hand |

The MSE material is three segments with `"scope": "mse"` in `src/timeline.json`. The core cut is a filter over that field, so dropping the conference framing is not an edit of anything. That is what makes the core reusable: it is the argument about OO-LD and machine-generated structured data, and it stands without the congress around it.

`mode` is an input prop beside `theme`, and it changes exactly one thing: the explanatory line at the foot of each slide. In front of an audience the speaker carries the argument and a slide that also writes it out competes with him; on a website nobody is speaking and the line has to be there. Everything else, including every frame number, is identical, so the two cuts cannot drift.

```bash
--props '{"theme":"dark","mode":"explain"}'
```

## Three marks

Every slide carries one of three marks in its top-left corner, or none.

| Mark | Means | Drawn as |
|---|---|---|
| **Built** | a present fact about a published artefact | filled |
| **Under way** | a public repository, with the status its own authors give it | outlined |
| **We argue** | a position this talk takes | outlined and dashed |

The talk is a perspective talk and makes all three kinds of claim. The marks are what stop the third borrowing the credibility of the first. Filled, outlined, dashed is a gradient of how settled a claim is, and it survives a projector that eats colour because it is a shape difference before it is a colour difference.

A beat can override its segment's mark (`"tier"` on a beat in `src/timeline.json`): a segment that argues a position can still rest one beat on something published, and `C6` closes by naming all three at once.

The mark also maps onto reuse. The built segments are the ones that transfer unchanged to oo-ld.org; the argued ones are the talk's own.

## The cut

`src/timeline.json` is the single table of what runs and for how long. `npm run check` fails if the conference cut exceeds the slot.

```
node scripts/check-budget.mjs
```

| | frames | time |
|---|---|---|
| conference cut | 21260 | 11:49 |
| core cut | 19620 | 10:54 |
| budget | 21600 | 12:00 |

## Segments hard-cut

Nothing cross-dissolves across a segment boundary. That is a decision, not an omission, and two things depend on it:

- a speaker can play the segments one at a time and advance them by hand, instead of racing a fixed timeline;
- `renderSegmented` in `media/kit/rendiv.mjs` can render each segment as its own composition and concatenate without re-encoding, so changing one segment costs one segment's render rather than twelve minutes of frames. It refuses a non-zero overlap for exactly this reason.

Beats inside a segment hard-cut too, and each animates its own content in.

## Commands

```bash
npm install                        # runs ../kit/patch-rendiv.mjs
npx playwright install chromium

npm run check                      # example sync, theme, budget, types. Same as CI.
npm run studio                     # live preview, one composition at a time

npm run stills                     # presentation, light
npm run stills -- --theme dark
npm run stills -- --mode explain
npm run stills -- c5 c6            # only those segments

npm run render                     # every cut, slow
node scripts/render.mjs mse --theme light --mode presentation
node scripts/render.mjs --segments c6     # re-render one segment and restitch
```

Stills are the review surface. Nobody reviews twelve minutes of video in a pull request; they look at frames, and `scripts/stills.mjs` derives one per beat from `src/timeline.json` so a retimed segment cannot leave a beat uncovered.

## Where things live

- `src/timeline.json` - the cut. Segments, scopes, marks, beats and their lengths. Read by the compositions, the budget check and the still list.
- `src/copy.ts` - every string on screen, named by what a section is about rather than which number it currently has.
- `src/view.ts` - the mode, swapped per render pass exactly like the palette.
- `src/theme.ts`, `src/lib/`, `src/components/{Stage,Type,CodeBlock,Icons}.tsx` - the design system, copied from `media/tutorials/shared/` so the three videos read as one thing. `media/kit` is mechanics only by its own charter, and unifying the design system would change what the explainer and the series render, which is not this project's business. `scripts/check-theme.mjs` is the tutorials' guard with the mode added.
- `src/components/Chrome.tsx` - the marks, the top bar, the explanatory line, and the segment frame that lays beats out from the timeline.

The JSON in `C4` is `examples/Minimal.schema.json` from this repository, verbatim. It has to be inlined in `src/copy.ts` because the video bundle cannot read outside its own tree, so `npm run check` asserts the two have not drifted.

## The black-frame guard

`assertNoBlackFrames` runs on the light cuts only. The dark background is `#16161A`, which measures YAVG 35.2 in the encoded file, under the 37.9 that blackdetect's default `pix_th=0.10` resolves to in limited range; a sparse dark slide is therefore over 90 percent "black" pixels and every dark segment reports a hit at frame 0. The same segment reads 230.8 in the light palette and passes. The failure being guarded is a fade composited against nothing, which is a property of the cut rather than of the palette, and both cuts are the same timeline with the same boundaries.

## CI

`.github/workflows/talk.yml`, path-filtered so a spec-only change never triggers it.

| Trigger | Does |
|---|---|
| pull request touching `media/**` | `npm run check`, then renders the beats at the pull request and at its merge base in all four palette and mode combinations, and comments the ones that differ |
| push to `main` touching `media/talk/**` | renders the conference cut in presentation mode and the core cut in explain mode, both palettes, and publishes them plus the per-segment files to the `talk-latest` prerelease |
