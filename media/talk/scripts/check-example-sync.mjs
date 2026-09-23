// Segment C4 shows examples/Minimal.schema.json on screen. It is inlined in
// src/copy.ts because the video bundle cannot read outside its own tree, so this
// asserts the two have not drifted. A slide that claims to show a file from the
// specification repository has to actually show it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplePath = path.resolve(root, '../../examples/Minimal.schema.json');

// Both sides are newline-normalised. A Windows checkout has CRLF in copy.ts
// while examples/ may be LF; the comparison is about content, not line endings.
const lf = (text) => text.replace(/\r\n/g, '\n');

const copy = lf(fs.readFileSync(path.join(root, 'src/copy.ts'), 'utf-8'));
const inlined = copy.match(/export const minimalSchema = `([\s\S]*?)`;/)?.[1];
if (!inlined) {
  console.error('check-example-sync: minimalSchema not found in src/copy.ts');
  process.exit(1);
}

const onDisk = lf(fs.readFileSync(examplePath, 'utf-8')).trimEnd();

if (inlined !== onDisk) {
  console.error('check-example-sync: src/copy.ts has drifted from examples/Minimal.schema.json\n');
  const a = inlined.split('\n');
  const b = onDisk.split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) {
      console.error(`  line ${i + 1}`);
      console.error(`    copy.ts: ${a[i] ?? '<missing>'}`);
      console.error(`    example: ${b[i] ?? '<missing>'}`);
    }
  }
  process.exit(1);
}

console.log('check-example-sync: src/copy.ts matches examples/Minimal.schema.json');
