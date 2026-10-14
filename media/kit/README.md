# Render kit

Shared rendiv mechanics for the OO-LD video projects.

| Consumer | Where |
|---|---|
| Explainer | `media/explainer` |
| Tutorial series | `media/tutorials` |
| Prototype Fund pitch deck | `second-stage/pitch` in the private `OO-LD/project-management` repository |

The pitch deck already pins this repository for the design system (`design-pin.json` plus `scripts/sync-design.mjs`) and pulls `media/kit` through the same pin, so there is one copy of these mechanics rather than three.

## What belongs here

Only the parts that are identical everywhere: resolving the rendiv CLI and the ffmpeg binary, parsing filter arguments, invoking a still or a render, stitching segments, checking the result, and the legibility arithmetic in `legibility.mjs`.

What to render stays with each project. A beat list, an episode table and a slide timeline have nothing in common beyond the calls they end up making, and moving them here would produce a module that has to know about all three. The same line applies to `legibility.mjs`: the arithmetic is shared, the palette, the type scale and the timeline it is run against are not.

## Reviewing what was rendered

`review.mjs` answers "what did this pull request change". A contact sheet answers "what do the slides look like". Neither answers "can someone who was not in the room read this, and is it true".

[`CONTENT-REVIEW.md`](CONTENT-REVIEW.md) is the pass that does, and it names the failure modes that recur across the projects. All of them pass the obvious check, which is why they are worth a list: contrast that only fails once a layer is composited, a type floor that covers styled text but not the strapline baked into a logo strip, a label exactly as far from its own mark as from the next one, and a corrected asset shipping alongside the original it was meant to replace.

`legibility.mjs` is the measurement half: `contrastRatio` and `blend` for the first, `effectivePx` and `assertTypeFloor` for the second, and `readingLoadReport` for how much text a frame asks a viewer to read in the time it is on screen. Pure functions, no I/O. Projects wire them into their own check script, the way each already owns its funding-statement check.

Report per state rather than per video. A timeline averages inside a comfortable reading band while half its frames run at three times the ceiling and the other half hold a finished state with nothing arriving, and only a per-state table prompts the redistribution that fixes it.

## Segmented rendering

`renderSegmented` renders each segment as its own composition and concatenates with `-c copy`, so editing one segment costs one segment's render instead of the whole timeline.

It only works when segments hard-cut. A cross-dissolve composites the outgoing scene under the incoming one; a segment rendered on its own has nothing underneath, so the incoming fade resolves against a transparent canvas and encodes as black. The output then has a black flash at every boundary and no dissolve anywhere, while both the render and the concat report success.

`renderSegmented` therefore refuses an overlap other than 0, and `assertNoBlackFrames` checks the stitched file for the failure it is built to avoid. Projects that cross-fade render the whole timeline in one pass: the explainer and the tutorial episodes both do.

## Windows entry paths

`patch-rendiv.mjs` works around [rendiv#11](https://github.com/thecodacus/rendiv/issues/11). Run it from the consuming project so it patches that project's `node_modules`:

```json
"postinstall": "node ../kit/patch-rendiv.mjs"
```

npm sets the working directory to the package being installed, which is what the script resolves against. It also accepts an explicit root as its first argument.
