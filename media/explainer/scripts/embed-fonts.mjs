// Rebuilds src/fonts.css with the font files inlined as data URIs.
//
//   node scripts/embed-fonts.mjs
//
// A @font-face pointing at a URL is a network request the renderer has to win
// before it screenshots, and it does not always win: rendering through the
// bundled static server on Linux produced frames in the DejaVu fallback, a few
// pixels wider per glyph, on exactly the frames carrying mono text. Inlining
// removes the request.
//
// The sources stay in public/fonts next to their OFL notices, so the licence
// travels with the files rather than only with the generated CSS.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FACES = [
  { family: 'Inter', weight: '100 900', file: 'inter-latin-var.woff2' },
  { family: 'JetBrains Mono', weight: '100 800', file: 'jetbrains-mono-latin-var.woff2' },
];

const header = `/* Latin subsets of the variable fonts, embedded rather than fetched.

   A @font-face that points at a URL is a network request the renderer has to
   win before it screenshots. It does not always win: rendering through the
   bundled static server on Linux produced frames in the DejaVu fallback, a few
   pixels wider per glyph, deterministically and only on the frames carrying
   mono text. Inlining removes the request, which is what media/tutorials
   already does.

   Sources are in public/fonts with their OFL notices. Regenerate with
   scripts/embed-fonts.mjs after replacing either file. */
`;

const blocks = FACES.map(({ family, weight, file }) => {
  const b64 = fs.readFileSync(path.join(root, 'public/fonts', file)).toString('base64');
  return `
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: url(data:font/woff2;base64,${b64}) format('woff2');
}`;
});

const out = path.join(root, 'src/fonts.css');
fs.writeFileSync(out, `${header}${blocks.join('\n')}\n`);
console.log(`src/fonts.css: ${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${FACES.length} faces`);
