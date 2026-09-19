// Upstream bug in @rendiv/bundler 0.2.6: the absolute entry path is interpolated
// into `import '${importPath}'` without normalisation. On Windows the backslashes
// become string escapes, so ".../2025-11-26_PrototypeFund/..." is parsed as an
// octal escape and Rollup fails to resolve the entry. @rendiv/studio already
// normalises its equivalent path; the renderer path does not.
// See https://github.com/thecodacus/rendiv/issues/11
//
// The root is the working directory, not a path relative to this file: npm runs
// a postinstall with cwd set to the package being installed, and this script is
// shared by projects that sit at different depths. Deriving it from the script
// location would patch whichever project happens to be its neighbour.
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const target = path.join(root, 'node_modules/@rendiv/bundler/dist/render-entry-code.js');

const from = 'const importPath = userEntryPoint;';
const to = "const importPath = userEntryPoint.replace(/\\\\/g, '/');";

if (!fs.existsSync(target)) {
  console.log(`patch-rendiv: bundler not installed under ${root}, skipping`);
  process.exit(0);
}

const src = fs.readFileSync(target, 'utf-8');

if (src.includes(to)) {
  console.log('patch-rendiv: already applied');
} else if (src.includes(from)) {
  fs.writeFileSync(target, src.replace(from, to));
  console.log('patch-rendiv: applied');
} else {
  // Not fatal: a bumped @rendiv/bundler that fixed this upstream must not break
  // `npm ci`.
  console.log('patch-rendiv: anchor not found, assuming upstream fixed it');
}
