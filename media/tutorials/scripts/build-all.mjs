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
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.resolve(root, 'node_modules/@rendiv/cli/dist/cli.js');

const EPISODES = [
  ['ep1', 'Ep1Principles'],
  ['ep2', 'Ep2Anatomy'],
  ['ep3', 'Ep3Composition'],
  ['ep4', 'Ep4Graph'],
  ['ep5', 'Ep5Python'],
];

const argv = process.argv.slice(2);
const stillsOnly = argv.includes('--stills');
const videoOnly = argv.includes('--video');
const ti = argv.indexOf('--theme');
const themes = ti >= 0 ? [argv[ti + 1]] : ['light', 'dark'];
// ti is -1 when --theme is absent, and ti + 1 is then 0, which would drop the
// first positional argument. Only skip the flag's value when there is a flag.
const only = argv.filter((a, i) => !a.startsWith('--') && !(ti >= 0 && i === ti + 1));

const run = (cwd, args) =>
  execFileSync(process.execPath, [cli, ...args], { cwd, stdio: 'pipe' });

const done = [];
for (const [dir, comp] of EPISODES) {
  if (only.length && !only.includes(dir)) continue;
  const cwd = path.join(root, dir);
  const beatsPath = path.join(cwd, 'src/beats.json');
  if (!fs.existsSync(beatsPath)) {
    console.log(`${dir}: no beats.json, skipping`);
    continue;
  }
  const beats = JSON.parse(fs.readFileSync(beatsPath, 'utf-8'));

  for (const theme of themes) {
    const props = JSON.stringify({ theme });

    if (!videoOnly) {
      const outDir = `out/stills-${theme}`;
      fs.mkdirSync(path.join(cwd, outDir), { recursive: true });
      process.stdout.write(`${dir} ${theme} stills: `);
      for (const { name, frame } of beats) {
        run(cwd, ['still', 'src/index.tsx', comp, `${outDir}/${name}.png`,
          '--frame', String(frame), '--props', props]);
        process.stdout.write('.');
      }
      console.log(` ${beats.length}`);
    }

    if (!stillsOnly) {
      const out = `out/${dir}-${theme}.mp4`;
      process.stdout.write(`${dir} ${theme} video: `);
      run(cwd, ['render', 'src/index.tsx', comp, out, '--props', props,
        '--concurrency', '6', '--crf', '18']);
      const mb = (fs.statSync(path.join(cwd, out)).size / 1024 / 1024).toFixed(1);
      console.log(`${mb} MB`);
      done.push(`${dir}-${theme}`);
    }
  }
}

if (done.length) console.log(`\nrendered: ${done.join(' ')}`);
