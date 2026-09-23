// Renders the talk.
//
//   node scripts/render.mjs                    every cut below
//   node scripts/render.mjs core               only the core cuts
//   node scripts/render.mjs --theme dark       one palette
//   node scripts/render.mjs --segments c6      re-render one segment and restitch
//
// Cuts:
//   out/oold-talk-mse-<mode>-<theme>.mp4    the conference cut
//   out/oold-talk-core-<mode>-<theme>.mp4   the same core, no conference framing
//
// Segments hard-cut, so each one renders as its own composition and the pieces
// are concatenated without re-encoding (media/kit/rendiv.mjs). Editing one
// segment therefore costs one segment's render rather than twelve minutes of
// frames. That is only sound because nothing cross-dissolves across a boundary;
// `renderSegmented` refuses a non-zero overlap and `assertNoBlackFrames` checks
// the stitched file for the failure the rule exists to prevent.
//
// That check runs on the light cuts only, and not because the dark ones matter
// less. The dark background is #16161A, which measures YAVG 35.2 in the encoded
// file, under the 37.9 that blackdetect's default pix_th=0.10 resolves to in
// limited range. A sparse dark slide is therefore over 90 percent "black" pixels
// and every dark segment reports a hit at frame 0. Measured, not assumed: the
// same segment reads 230.8 in the light palette and passes. The failure being
// guarded is a fade composited against nothing, which is a property of the cut
// rather than of the palette, and both cuts are the same timeline with the same
// boundaries, so the light one answers the question for both.
const GUARDED = 'light';
import fs from 'node:fs';
import path from 'node:path';
import { assertNoBlackFrames, parseArgs, renderSegmented, sizeMB } from '../../kit/rendiv.mjs';
import { clock, cut, root, totalOf } from './beats.mjs';

const { values, filters } = parseArgs(process.argv.slice(2), ['theme', 'mode', 'segments']);

const scopes = ['mse', 'core'].filter((s) => !filters.length || filters.includes(s));
const themes = values.theme ? [values.theme] : ['light', 'dark'];
const modes = values.mode ? [values.mode] : ['presentation', 'explain'];
const only = values.segments ? values.segments.split(',') : [];

fs.mkdirSync(path.join(root, 'out'), { recursive: true });

for (const scope of scopes) {
  for (const mode of modes) {
    for (const theme of themes) {
      const out = `out/oold-talk-${scope}-${mode}-${theme}.mp4`;
      console.log(`\n=== ${scope} ${mode} ${theme} (${clock(totalOf(scope))}) ===`);

      // Segment files are per combination: the same segment rendered in two
      // palettes is two different videos, and a shared cache directory would
      // concatenate whichever was written last.
      const file = renderSegmented({
        root,
        entry: 'src/index.tsx',
        out,
        segments: cut(scope).map((s) => ({ id: s.id, name: s.id })),
        overlap: 0,
        segmentDir: `out/segments/${scope}-${mode}-${theme}`,
        props: { theme, mode },
        filters: only,
      });

      if (theme === GUARDED) assertNoBlackFrames(root, file);
      console.log(`${out}  ${sizeMB(file)} MB`);
    }
  }
}
