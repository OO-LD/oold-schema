// Fails if a module-scope binding captures a palette value.
//
// applyTheme swaps the contents of the shared `colors` object once per render,
// above every scene. That works only because every consumer reads colors.x
// during its own render. A module-scope `const c = colors.ink` is evaluated at
// import time, before applyTheme has run, so it freezes the light value and the
// dark cut comes out half light. The failure is silent: nothing errors, the
// render succeeds, and only a human looking at the frame notices.
//
// Also flags raw hex literals outside the theme, which cannot switch at all.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['shared', 'ep1/src', 'ep2/src', 'ep3/src', 'ep4/src', 'ep5/src'];

const walk = (dir) => {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
};

const TOP_LEVEL_CONST = /^const\s+[A-Za-z_$][\w$]*/;
const PALETTE = /\b(?:colors|brand)\.[a-zA-Z_]/;
const HEX = /['"]#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?['"]/;

// An unindented const mentioning the palette, unless it is a function: a
// function body runs at call time, which is per render and therefore safe.
const isCapture = (line) =>
  TOP_LEVEL_CONST.test(line) && PALETTE.test(line) && !line.includes('=>');

const problems = [];
for (const r of roots) {
  for (const file of walk(path.join(root, r))) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    if (rel === 'shared/theme.ts') continue; // the palette itself
    fs.readFileSync(file, 'utf-8').split(/\r?\n/).forEach((line, i) => {
      if (isCapture(line)) {
        problems.push(`${rel}:${i + 1}  module-scope palette capture: ${line.trim()}`);
      } else if (HEX.test(line) && !line.trim().startsWith('//')) {
        problems.push(`${rel}:${i + 1}  hard-coded colour, will not switch theme: ${line.trim()}`);
      }
    });
  }
}

if (problems.length) {
  console.error('theme check failed:\n');
  for (const p of problems) console.error('  ' + p);
  console.error('\nRead a palette value inside the component, or wrap it in a function.');
  process.exit(1);
}
console.log('theme check: no module-scope palette captures, no hard-coded colours');
