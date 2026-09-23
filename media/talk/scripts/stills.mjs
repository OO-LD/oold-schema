// One still per beat, for checking layout and copy without rendering a twelve
// minute video.
//
//   node scripts/stills.mjs                              presentation, light
//   node scripts/stills.mjs --theme dark                 the dark palette
//   node scripts/stills.mjs --mode explain               the self-explaining cut
//   node scripts/stills.mjs c5 c6                        only those segments
//
// Both the palette and the mode arrive as input props, so a beat that reads
// correctly in one combination can be wrong in another: a module-scope capture
// freezes the light palette, and an explanatory line can collide with a slide
// that fits without it. All four combinations are renderable from here for that
// reason, and out/ keeps them apart.
//
// Stills are taken from each segment's own composition, so the frame numbers are
// local and stay valid when a segment earlier in the cut is retimed.
import fs from 'node:fs';
import path from 'node:path';
import { matches, parseArgs, still } from '../../kit/rendiv.mjs';
import { beatsOf, root, timeline } from './beats.mjs';

const { values, filters } = parseArgs(process.argv.slice(2), ['theme', 'mode', 'out']);
const theme = values.theme ?? 'light';
const mode = values.mode ?? 'presentation';
if (!['light', 'dark'].includes(theme)) throw new Error(`Unknown theme ${theme}`);
if (!['presentation', 'explain'].includes(mode)) throw new Error(`Unknown mode ${mode}`);

const outDir = values.out ?? `out/stills-${mode}-${theme}`;
fs.mkdirSync(path.join(root, outDir), { recursive: true });

let n = 0;
for (const segment of timeline.segments) {
  for (const beat of beatsOf(segment)) {
    if (!matches(filters, beat.name, segment.id.toLowerCase())) continue;
    process.stdout.write(`${beat.name} @ ${beat.frame} ... `);
    still({
      root,
      entry: 'src/index.tsx',
      composition: segment.id,
      out: `${outDir}/${beat.name}.png`,
      frame: beat.frame,
      props: { theme, mode },
    });
    console.log('ok');
    n += 1;
  }
}

console.log(`\n${n} stills in ${outDir} (${mode}, ${theme})`);
