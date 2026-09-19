// Tiles out/stills/*.png into a single contact sheet for review.
//
// One image beats fourteen: it embeds in a PR comment as one picture a reviewer
// takes in at a glance, and it is one upload instead of fourteen. Beat names are
// printed to stdout in reading order rather than drawn onto the sheet, so this
// needs no font file on the runner.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpegPath } from '../../kit/rendiv.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ffmpeg = ffmpegPath(root);
const stills = path.join(root, 'out/stills');
const out = path.join(root, 'out/contact-sheet.png');

const files = fs.readdirSync(stills).filter((f) => f.endsWith('.png')).sort();
if (!files.length) {
  console.error('no stills in out/stills; run npm run stills first');
  process.exit(1);
}

// tile works on one sequential stream, so stage the stills as 001.png, 002.png...
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheet-'));
files.forEach((f, i) => fs.copyFileSync(path.join(stills, f), path.join(tmp, `${String(i + 1).padStart(3, '0')}.png`)));

const cols = 3;
const rows = Math.ceil(files.length / cols);

execFileSync(ffmpeg, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', path.join(tmp, '%03d.png'),
  '-vf', `scale=640:-1,tile=${cols}x${rows}:padding=8:margin=8:color=white`,
  '-frames:v', '1',
  out,
]);
fs.rmSync(tmp, { recursive: true, force: true });

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
console.log(`contact sheet: ${files.length} stills, ${cols}x${rows}, ${mb} MB`);
console.log(files.map((f, i) => `${i + 1}. ${f.replace('.png', '')}`).join('\n'));
