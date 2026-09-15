// Renders every episode to out/<CompId>.mp4, one at a time. Serial on purpose:
// each render already uses several browser tabs, so running five at once just
// thrashes. Prints duration and size per episode at the end.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.resolve(root, 'node_modules/@rendiv/cli/dist/cli.js');
const ffmpeg = path.resolve(root, 'node_modules/ffmpeg-static/ffmpeg.exe');

const EPISODES = [
  ['ep1', 'Ep1Principles'],
  ['ep2', 'Ep2Anatomy'],
  ['ep3', 'Ep3Composition'],
  ['ep4', 'Ep4Graph'],
  ['ep5', 'Ep5Python'],
];

// --suffix tags the output so a new cut never overwrites an existing one:
//   node scripts/render-series.mjs --suffix voiced
const argv = process.argv.slice(2);
const sufIdx = argv.indexOf('--suffix');
const suffix = sufIdx >= 0 ? `-${argv[sufIdx + 1]}` : '';
const only = argv.filter((a, i) => !a.startsWith('--') && !(sufIdx >= 0 && i === sufIdx + 1));
const done = [];

for (const [dir, comp] of EPISODES) {
  if (only.length && !only.includes(dir)) continue;
  const cwd = path.join(root, dir);
  const out = `out/${comp}${suffix}.mp4`;
  console.log(`\n=== ${dir} / ${comp} ===`);
  try {
    execFileSync(
      process.execPath,
      [cli, 'render', 'src/index.tsx', comp, out, '--concurrency', '6', '--crf', '18'],
      { cwd, stdio: 'inherit' },
    );
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
  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(1);
  console.log(`${dir}  ${comp}  ${duration}  ${mb} MB  ${file}`);
}
if (done.length !== (only.length || EPISODES.length)) {
  console.error(`\n${(only.length || EPISODES.length) - done.length} episode(s) did not render`);
  process.exit(1);
}
