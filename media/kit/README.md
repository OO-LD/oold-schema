# Render kit

Shared rendiv mechanics for the OO-LD video projects.

| Consumer | Where |
|---|---|
| Explainer | `media/explainer` |
| Tutorial series | `media/tutorials` |
| Conference talk | `media/talk` |
| Prototype Fund pitch deck | `second-stage/pitch` in the private `OO-LD/project-management` repository |

The pitch deck already pins this repository for the design system (`design-pin.json` plus `scripts/sync-design.mjs`) and pulls `media/kit` through the same pin, so there is one copy of these mechanics rather than three.

## What belongs here

Only the parts that are identical everywhere: resolving the rendiv CLI and the ffmpeg binary, parsing filter arguments, invoking a still or a render, stitching segments, and checking the result.

What to render stays with each project. A beat list, an episode table and a slide timeline have nothing in common beyond the calls they end up making, and moving them here would produce a module that has to know about all three.

## Segmented rendering

`renderSegmented` renders each segment as its own composition and concatenates with `-c copy`, so editing one segment costs one segment's render instead of the whole timeline.

It only works when segments hard-cut. A cross-dissolve composites the outgoing scene under the incoming one; a segment rendered on its own has nothing underneath, so the incoming fade resolves against a transparent canvas and encodes as black. The output then has a black flash at every boundary and no dissolve anywhere, while both the render and the concat report success.

`renderSegmented` therefore refuses an overlap other than 0, and `assertNoBlackFrames` checks the stitched file for the failure it is built to avoid. Projects that cross-fade render the whole timeline in one pass: the explainer and the tutorial episodes both do. The talk hard-cuts on purpose, because a speaker advances its segments by hand, so it is the one consumer that uses this path.

`assertNoBlackFrames` cannot be run on a dark cut. The dark background measures YAVG 35.2 in the encoded file, under the 37.9 that blackdetect's default `pix_th=0.10` resolves to in limited range, so a sparse dark slide is over 90 percent "black" pixels and reports a hit at every segment start. The failure it guards is a fade composited against nothing, which is a property of the cut and not of the palette, so checking the light cut of the same timeline answers the question for both.

## Windows entry paths

`patch-rendiv.mjs` works around [rendiv#11](https://github.com/thecodacus/rendiv/issues/11). Run it from the consuming project so it patches that project's `node_modules`:

```json
"postinstall": "node ../kit/patch-rendiv.mjs"
```

npm sets the working directory to the package being installed, which is what the script resolves against. It also accepts an explicit root as its first argument.
