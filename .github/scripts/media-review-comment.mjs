// Builds the pull request comment for media-review.yml: uploads each composite
// to the review prerelease and writes the markdown to stdout.
//
// Images are release assets referenced by URL, never commits, so a review of a
// video keeps the repository free of binaries.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 && fallback === undefined) throw new Error(`Missing --${name}`);
  return i < 0 ? fallback : process.argv[i + 1];
};

const dir = path.resolve(arg('dir'));
const project = arg('project');
const repo = arg('repo');
const tag = arg('tag');
const pr = arg('pr');
const sha = arg('sha');

const entries = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => /^report-.*\.json$/.test(f))
      .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')))
  : [];

const out = [`### ${project} beats changed by this pull request`, ''];

const visual = entries.filter((e) => e.image);
const removed = entries.filter((e) => e.status === 'removed');
const noBaseline = entries.filter((e) => e.status === 'no-baseline');

if (!visual.length && !removed.length) {
  out.push(
    noBaseline.length
      ? 'No comparison was possible: the merge base could not be rendered for ' +
          `${noBaseline.map((e) => `\`${e.unit}\``).join(', ')}.`
      : 'No beat changed. The sources this pull request touches do not alter any rendered frame.',
  );
} else {
  const gh = (args) => execFileSync('gh', args, { encoding: 'utf-8' });
  try {
    gh(['release', 'view', tag, '--repo', repo]);
  } catch {
    gh(['release', 'create', tag, '--repo', repo, '--prerelease', '--notes',
      'Transient review images for pull requests. Not part of the source tree.']);
  }

  const byUnit = new Map();
  for (const e of entries) {
    if (!byUnit.has(e.unit)) byUnit.set(e.unit, []);
    byUnit.get(e.unit).push(e);
  }

  for (const [unit, items] of [...byUnit].sort()) {
    const shown = items.filter((i) => i.image);
    const gone = items.filter((i) => i.status === 'removed');
    if (!shown.length && !gone.length) continue;

    const tally = [
      [items.filter((i) => i.status === 'changed').length, 'changed'],
      [items.filter((i) => i.status === 'added').length, 'added'],
      [gone.length, 'removed'],
    ].filter(([n]) => n).map(([n, word]) => `${n} ${word}`).join(', ');

    out.push(`<details open><summary><b>${unit}</b> - ${tally}</summary>`, '');
    for (const item of shown) {
      // Asset names are unique per pull request and clobbered on re-run, so the
      // prerelease holds one image per beat rather than one per push.
      const asset = `pr-${pr}-${project}-${item.image}`;
      const src = path.join(dir, item.image);
      const staged = path.join(path.dirname(src), asset);
      fs.copyFileSync(src, staged);
      gh(['release', 'upload', tag, staged, '--repo', repo, '--clobber']);
      const url = `https://github.com/${repo}/releases/download/${tag}/${asset}`;
      const label = item.status === 'added' ? 'added' : 'before | after';
      out.push(`**${item.beat}** (${label})`, '', `![${item.beat}](${url})`, '');
    }
    for (const item of gone) out.push(`- \`${item.beat}\` removed`, '');
    out.push('</details>', '');
  }
}

if (noBaseline.length && visual.length) {
  out.push(
    `Note: no merge-base render for ${noBaseline.map((e) => `\`${e.unit}\``).join(', ')}, ` +
      'so those units are not compared.',
    '',
  );
}

out.push(
  `Rendered from \`${sha}\`. Left is the merge base, right is this pull request. ` +
    `Images live on the \`${tag}\` prerelease, not in the repository.`,
);

process.stdout.write(`${out.join('\n')}\n`);
