// Builds every episode in both palettes: beat stills and the full mp4.
//
//   node scripts/build-all.mjs                  everything
//   node scripts/build-all.mjs --stills         stills only, fast
//   node scripts/build-all.mjs --theme dark     one palette
//   node scripts/build-all.mjs ep3 ep5          named episodes
//
// Outputs per episode:
//   out/stills-light/*.png   out/stills-dark/*.png
//   out/<ep>-light.mp4       out/<ep>-dark.mp4
//
// Renders are serial: each already uses several browser tabs, so running them
// together just thrashes. Each runs with cwd set to its own episode directory,
// which is what keeps the rendiv bundler from racing over its temp entry file.
//
// Each episode is rendered in one pass rather than scene by scene. The scenes
// cross-dissolve (OVERLAP in shared/theme.ts), and a dissolve needs the outgoing
// scene composited under the incoming one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, render, sizeMB, still } from '../../kit/rendiv.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const EPISODES = [
  ['ep1', 'Ep1Principles'],
  ['ep2', 'Ep2Anatomy'],
  ['ep3', 'Ep3Composition'],
  ['ep4', 'Ep4Graph'],
  ['ep5', 'Ep5Python'],
];

const { flags, values, filters } = parseArgs(process.argv.slice(2), ['theme']);
const stillsOnly = flags.has('stills');
const videoOnly = flags.has('video');
const themes = values.theme ? [values.theme] : ['light', 'dark'];

const done = [];
for (const [dir, comp] of EPISODES) {
  if (filters.length && !filters.includes(dir)) continue;
  const cwd = path.join(root, dir);
  const beatsPath = path.join(cwd, 'src/beats.json');
  if (!fs.existsSync(beatsPath)) {
    console.log(`${dir}: no beats.json, skipping`);
    continue;
  }
  const beats = JSON.parse(fs.readFileSync(beatsPath, 'utf-8'));

  for (const theme of themes) {
    const props = { theme };

    if (!videoOnly) {
      const outDir = `out/stills-${theme}`;
      fs.mkdirSync(path.join(cwd, outDir), { recursive: true });
      process.stdout.write(`${dir} ${theme} stills: `);
      for (const { name, frame } of beats) {
        still({
          root,
          cwd,
          entry: 'src/index.tsx',
          composition: comp,
          out: `${outDir}/${name}.png`,
          frame,
          props,
        });
        process.stdout.write('.');
      }
      console.log(` ${beats.length}`);
    }

    if (!stillsOnly) {
      const out = `out/${dir}-${theme}.mp4`;
      process.stdout.write(`${dir} ${theme} video: `);
      render({ root, cwd, entry: 'src/index.tsx', composition: comp, out, props });
      console.log(`${sizeMB(path.join(cwd, out))} MB`);
      done.push(`${dir}-${theme}`);
    }
  }
}

if (done.length) console.log(`\nrendered: ${done.join(' ')}`);
