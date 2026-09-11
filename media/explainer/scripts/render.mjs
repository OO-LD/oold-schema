// Renders the explainer in both palettes:
//   out/oold-explainer.mp4        light
//   out/oold-explainer-dark.mp4   dark
//
// Same composition, same timings, same words. The palette is an input prop, so
// the two cuts cannot drift apart the way two source files would.
//
// The video carries no version number. Git history is the record of what
// changed; a number stamped on the artefact only invites the question of which
// cut someone is looking at, which the commit already answers.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'node_modules/@rendiv/cli/dist/cli.js');

const only = process.argv.slice(2);
const cuts = [
  ['light', 'out/oold-explainer.mp4'],
  ['dark', 'out/oold-explainer-dark.mp4'],
].filter(([theme]) => !only.length || only.includes(theme));

for (const [theme, out] of cuts) {
  console.log(`\n=== ${theme} ===`);
  execFileSync(
    process.execPath,
    [cli, 'render', 'src/index.tsx', 'OOLDExplainer', out,
     '--props', JSON.stringify({ theme }), '--concurrency', '6', '--crf', '18'],
    { cwd: root, stdio: 'inherit' },
  );
}
