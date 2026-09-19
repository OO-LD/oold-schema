// Renders a media project's stills twice, at the pull request and at its merge
// base, and reports the beats whose pixels changed.
//
//   node ../kit/review.mjs plan     --project tutorials --changed changed.txt
//   node ../kit/review.mjs render   --project tutorials --units '[...]' --out DIR
//   node ../kit/review.mjs compare  --before DIR --after DIR --out DIR
//
// A contact sheet answers "what do the slides look like"; it does not answer
// "what did this pull request change", and the two are not the same question. A
// scene label rendered in the light palette on the dark cut looks perfectly
// plausible in isolation, and did in fact survive review that way. Only a
// before-and-after says so.
//
// The comparison is on the encoded bytes. Both sides are rendered by the same
// toolchain in the same job, so identical pixels produce identical files, and
// any difference at all is worth a reviewer's eye.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ffmpegPath } from './rendiv.mjs';

const THEMES = ['light', 'dark'];

// Which project a changed path belongs to. The kit is shared, so a change to it
// is a change to every project that pulls it.
const OWNERS = {
  explainer: [/^media\/explainer\//, /^media\/kit\//, /^examples\/Minimal\.schema\.json$/],
  tutorials: [/^media\/tutorials\//, /^media\/kit\//],
};

// Within the tutorial series, shared sources reach every episode; an episode
// directory reaches only itself.
const EPISODE_DIR = /^media\/tutorials\/(ep\d+)\//;
const TUTORIALS_WIDE = [/^media\/tutorials\/(shared|scripts)\//, /^media\/kit\//,
  /^media\/tutorials\/(package\.json|package-lock\.json|tsconfig[^/]*\.json)$/];

const EPISODES = ['ep1', 'ep2', 'ep3', 'ep4', 'ep5'];

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) {
    if (fallback === undefined) throw new Error(`Missing --${name}`);
    return fallback;
  }
  return process.argv[i + 1];
};

// A unit is one renderable thing, named as a string: a theme for the explainer,
// `episode-theme` for the series. A string rather than an object because these
// travel through a workflow matrix, where an object arrives pretty-printed and
// a multi-line value is not a valid step output.
function plan(project, changed) {
  const touches = (patterns) => changed.some((f) => patterns.some((p) => p.test(f)));
  if (!touches(OWNERS[project])) return [];

  if (project === 'explainer') return [...THEMES];

  const wide = touches(TUTORIALS_WIDE);
  const episodes = wide
    ? EPISODES
    : EPISODES.filter((ep) => changed.some((f) => EPISODE_DIR.exec(f)?.[1] === ep));
  return episodes.flatMap((episode) => THEMES.map((theme) => `${episode}-${theme}`));
}

const parseUnit = (name) => {
  const m = /^(ep\d+)-(\w+)$/.exec(name);
  return m ? { episode: m[1], theme: m[2] } : { theme: name };
};

// Renders through each project's own script, so the project stays the single
// definition of what a beat is and where it sits in the timeline.
function render(project, root, name, outDir) {
  const unit = parseUnit(name);
  const dest = path.join(outDir, name);
  fs.mkdirSync(dest, { recursive: true });

  let produced;
  if (project === 'explainer') {
    execFileSync(process.execPath, ['scripts/stills.mjs', '--theme', unit.theme],
      { cwd: root, stdio: 'inherit' });
    produced = path.join(root, 'out/stills');
  } else {
    execFileSync(
      process.execPath,
      ['scripts/build-all.mjs', '--stills', '--theme', unit.theme, unit.episode],
      { cwd: root, stdio: 'inherit' },
    );
    produced = path.join(root, unit.episode, `out/stills-${unit.theme}`);
  }

  if (!fs.existsSync(produced)) throw new Error(`No stills at ${produced}`);
  for (const f of fs.readdirSync(produced).filter((f) => f.endsWith('.png'))) {
    fs.copyFileSync(path.join(produced, f), path.join(dest, f));
  }
  // Renders are sequential into the same directory, so a stale beat from the
  // previous unit would otherwise be copied into the next one.
  fs.rmSync(produced, { recursive: true, force: true });
  return dest;
}

const digest = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const beatsIn = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort() : [];

// Before and after at half width, separated by a rule, so a reviewer reads one
// image rather than opening two.
function composite(root, before, after, out) {
  const W = 900;
  execFileSync(ffmpegPath(root), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', before, '-i', after,
    '-filter_complex',
    `[0:v]scale=${W}:-1[a];[1:v]scale=${W}:-1[b];` +
      `[a]pad=iw+6:ih:0:0:color=0xE8554E[ap];[ap][b]hstack=inputs=2`,
    out,
  ]);
}

function compare(root, beforeRoot, afterRoot, outRoot) {
  fs.mkdirSync(outRoot, { recursive: true });
  const report = [];

  const units = fs.existsSync(afterRoot)
    ? fs.readdirSync(afterRoot).filter((d) => fs.statSync(path.join(afterRoot, d)).isDirectory())
    : [];

  for (const unit of units.sort()) {
    const b = path.join(beforeRoot, unit);
    const a = path.join(afterRoot, unit);
    const before = new Set(beatsIn(b));
    const after = beatsIn(a);

    // The merge base could not be rendered: its sources predate this unit, or
    // its install failed. Every beat would otherwise be reported as added,
    // which reads as a hundred findings where there is one fact.
    if (!before.size) {
      report.push({ unit, status: 'no-baseline' });
      continue;
    }

    for (const beat of after) {
      const name = beat.replace(/\.png$/, '');
      if (!before.has(beat)) {
        const dest = path.join(outRoot, `${unit}--${name}.png`);
        fs.copyFileSync(path.join(a, beat), dest);
        report.push({ unit, beat: name, status: 'added', image: path.basename(dest) });
        continue;
      }
      if (digest(path.join(b, beat)) === digest(path.join(a, beat))) continue;
      const dest = path.join(outRoot, `${unit}--${name}.png`);
      composite(root, path.join(b, beat), path.join(a, beat), dest);
      report.push({ unit, beat: name, status: 'changed', image: path.basename(dest) });
    }

    for (const beat of before) {
      if (!after.includes(beat)) {
        report.push({ unit, beat: beat.replace(/\.png$/, ''), status: 'removed' });
      }
    }
  }

  // Named for the units it covers: each matrix job uploads its own directory and
  // they are merged into one, where a shared filename would silently overwrite.
  const name = units.length ? `report-${units.sort().join('_')}.json` : 'report.json';
  fs.writeFileSync(path.join(outRoot, name), JSON.stringify(report, null, 2));
  return report;
}

const cmd = process.argv[2];
const root = path.resolve(arg('root', process.cwd()));

if (cmd === 'plan') {
  const changed = fs.readFileSync(arg('changed'), 'utf-8').split(/\r?\n/).filter(Boolean);
  process.stdout.write(JSON.stringify(plan(arg('project'), changed)));
} else if (cmd === 'render') {
  render(arg('project'), root, arg('unit'), path.resolve(arg('out')));
} else if (cmd === 'compare') {
  const report = compare(root, path.resolve(arg('before')), path.resolve(arg('after')),
    path.resolve(arg('out')));
  const changed = report.filter((r) => r.status === 'changed').length;
  const added = report.filter((r) => r.status === 'added').length;
  const removed = report.filter((r) => r.status === 'removed').length;
  console.log(`${changed} changed, ${added} added, ${removed} removed`);
} else {
  console.error('usage: review.mjs plan|render|compare [...]');
  process.exit(2);
}
