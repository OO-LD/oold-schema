// Renders the full episode to out/Ep3Composition.mp4.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.resolve(root, '../node_modules/@rendiv/cli/dist/cli.js');

execFileSync(
  process.execPath,
  [cli, 'render', 'src/index.tsx', 'Ep3Composition', 'out/Ep3Composition.mp4',
   '--concurrency', '4', '--crf', '18'],
  { cwd: root, stdio: 'inherit' },
);
