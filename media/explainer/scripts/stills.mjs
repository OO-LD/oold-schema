// Renders one still per story beat so layout and copy can be checked without a
// full 2700-frame render. Frame numbers are absolute in the OOLDExplainer timeline.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matches, parseArgs, still } from '../../kit/rendiv.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(root, 'out/stills'), { recursive: true });

const beats = [
  ['01-hook-panels', 140],
  ['02-hook-broken', 210],
  ['03-hook-punch', 330],
  ['04-clarity', 700],
  ['05-merge-apart', 800],
  ['06-merge-union', 960],
  ['07-code-reveal', 1080],
  ['08-code-wash', 1200],
  ['09-outputs', 1400],
  ['10-domains', 1780],
  ['11-domains-closing', 2110],
  ['12-proof-story', 2280],
  ['13-proof-facts', 2420],
  ['14-end-card', 2620],
];

const { filters } = parseArgs(process.argv.slice(2));

for (const [name, frame] of beats) {
  if (!matches(filters, name, name)) continue;
  process.stdout.write(`${name} @ ${frame} ... `);
  still({
    root,
    entry: 'src/index.tsx',
    composition: 'OOLDExplainer',
    out: `out/stills/${name}.png`,
    frame,
  });
  console.log('ok');
}
