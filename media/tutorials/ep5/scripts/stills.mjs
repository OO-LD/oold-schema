// Renders one PNG per entry in beats.json into out/stills/.
// cwd is pinned to this episode dir so the rendiv bundler never races another
// episode over its temporary __rendiv_entry__.jsx.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.resolve(root, '../node_modules/@rendiv/cli/dist/cli.js');
fs.mkdirSync(path.join(root, 'out/stills'), { recursive: true });

const beats = JSON.parse(fs.readFileSync(path.join(root, 'src/beats.json'), 'utf-8'));
const only = process.argv.slice(2);

for (const { name, frame } of beats) {
  if (only.length && !only.some((f) => name.includes(f))) continue;
  process.stdout.write(`${name} @ ${frame} ... `);
  execFileSync(
    process.execPath,
    [cli, 'still', 'src/index.tsx', 'Ep5Python', `out/stills/${name}.png`, '--frame', String(frame)],
    { cwd: root, stdio: 'pipe' },
  );
  console.log('ok');
}
