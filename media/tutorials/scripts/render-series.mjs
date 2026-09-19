// Renders every episode to out/<CompId>.mp4, one at a time. Serial on purpose:
// each render already uses several browser tabs, so running five at once just
// thrashes. Prints duration and size per episode at the end.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpegPath, parseArgs, render, sizeMB } from '../../kit/rendiv.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ffmpeg = ffmpegPath(root);

const EPISODES = [
  ['ep1', 'Ep1Principles'],
  ['ep2', 'Ep2Anatomy'],
  ['ep3', 'Ep3Composition'],
  ['ep4', 'Ep4Graph'],
  ['ep5', 'Ep5Python'],
];

// --suffix tags the output so a new cut never overwrites an existing one:
//   node scripts/render-series.mjs --suffix voiced
const { values, filters: only } = parseArgs(process.argv.slice(2), ['suffix']);
const suffix = values.suffix ? `-${values.suffix}` : '';
const done = [];

for (const [dir, comp] of EPISODES) {
  if (only.length && !only.includes(dir)) continue;
  const cwd = path.join(root, dir);
  const out = `out/${comp}${suffix}.mp4`;
  console.log(`\n=== ${dir} / ${comp} ===`);
  try {
    render({ root, cwd, entry: 'src/index.tsx', composition: comp, out, stdio: 'inherit' });
    done.push([dir, comp, path.join(cwd, out)]);
  } catch {
    console.error(`${dir} FAILED to render`);
  }
}

console.log('\n=== summary ===');
for (const [dir, comp, file] of done) {
  let duration = 'unknown';
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', file], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    duration = (e.stderr.toString().match(/Duration: (\d+:\d+:\d+\.\d+)/) || [])[1] ?? 'unknown';
  }
  const mb = sizeMB(file);
  console.log(`${dir}  ${comp}  ${duration}  ${mb} MB  ${file}`);
}
if (done.length !== (only.length || EPISODES.length)) {
  console.error(`\n${(only.length || EPISODES.length) - done.length} episode(s) did not render`);
  process.exit(1);
}
