// Renders the explainer in both palettes:
//   out/oold-explainer.mp4        light
//   out/oold-explainer-dark.mp4   dark
//
// Same composition, same timings, same words. The palette is an input prop, so
// the two cuts cannot drift apart the way two source files would.
//
// The whole timeline is rendered in one pass. The scenes cross-dissolve
// (OVERLAP in src/theme.ts), and a dissolve needs the outgoing scene composited
// under the incoming one, which segment-by-segment rendering cannot provide.
//
// The video carries no version number. Git history is the record of what
// changed; a number stamped on the artefact only invites the question of which
// cut someone is looking at, which the commit already answers.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, render } from '../../kit/rendiv.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { filters } = parseArgs(process.argv.slice(2));

const cuts = [
  ['light', 'out/oold-explainer.mp4'],
  ['dark', 'out/oold-explainer-dark.mp4'],
].filter(([theme]) => !filters.length || filters.includes(theme));

for (const [theme, out] of cuts) {
  console.log(`\n=== ${theme} ===`);
  render({
    root,
    entry: 'src/index.tsx',
    composition: 'OOLDExplainer',
    out,
    props: { theme },
    stdio: 'inherit',
  });
}
