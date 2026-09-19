// Shared rendiv mechanics for the OO-LD video projects: the explainer, the
// tutorial series, and the Prototype Fund pitch deck in the private
// project-management repository.
//
// Only the mechanics live here. What to render stays with each project, because
// a beat list, an episode table and a slide timeline have nothing in common
// beyond the calls they end up making.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const cliPath = (root) => path.resolve(root, 'node_modules/@rendiv/cli/dist/cli.js');

export const ffmpegPath = (root) =>
  path.resolve(
    root,
    'node_modules/ffmpeg-static',
    process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
  );

// Splits argv into flags, their values, and the remaining positional filters.
// `valueFlags` names the flags that consume the following argument; without it
// a flag's value is indistinguishable from a filter and gets treated as one.
export function parseArgs(argv, valueFlags = []) {
  const values = {};
  const consumed = new Set();

  for (const flag of valueFlags) {
    const i = argv.indexOf(`--${flag}`);
    if (i < 0) continue;
    values[flag] = argv[i + 1];
    consumed.add(i + 1);
  }

  return {
    values,
    flags: new Set(argv.filter((a) => a.startsWith('--')).map((a) => a.slice(2))),
    filters: argv.filter((a, i) => !a.startsWith('--') && !consumed.has(i)),
  };
}

// True when no filter is given, or when one of them matches the name or id.
export const matches = (filters, name, id) =>
  !filters.length || filters.some((f) => name.includes(f) || id === f);

const propsArg = (props) => (props ? ['--props', JSON.stringify(props)] : []);

// `root` locates node_modules, `cwd` is where the render runs. They differ when
// several compositions share one install: the tutorial episodes each render from
// their own directory against the toolchain installed one level up.
const run = (root, cwd, args, stdio = 'pipe') =>
  execFileSync(process.execPath, [cliPath(root), ...args], { cwd: cwd ?? root, stdio });

export function still({ root, cwd, entry, composition, out, frame, props }) {
  run(root, cwd, ['still', entry, composition, out, '--frame', String(frame), ...propsArg(props)]);
}

export function render({
  root,
  cwd,
  entry,
  composition,
  out,
  props,
  concurrency = 6,
  crf = 18,
  stdio = 'pipe',
}) {
  run(
    root,
    cwd,
    [
      'render', entry, composition, out,
      ...propsArg(props),
      '--concurrency', String(concurrency),
      '--crf', String(crf),
    ],
    stdio,
  );
}

// Renders each segment as its own composition and concatenates without
// re-encoding, so editing one segment costs one segment's render.
//
// This is only sound when segments hard-cut. A cross-dissolve composites the
// outgoing scene under the incoming one, and a segment rendered on its own has
// nothing underneath: the incoming fade resolves against a transparent canvas,
// which encodes as black. The result is a black flash at every boundary and no
// dissolve anywhere. `overlap` must therefore be 0, and callers that cross-fade
// have to render the whole timeline in one pass.
//
// rendiv's own --frames would express a range of the full timeline and keep the
// dissolves, but it names intermediate PNGs by absolute frame number
// (frame-000346.png) while ffmpeg's %06d sequence starts at zero, so an offset
// range fails to open. Every segment here starts at frame 0 and avoids it.
export function renderSegmented({
  root,
  entry,
  out,
  segments,
  overlap,
  segmentDir = 'out/segments',
  props,
  filters = [],
  concurrency = 6,
  crf = 18,
  log = console.log,
}) {
  if (overlap !== 0) {
    throw new Error(
      `renderSegmented needs hard cuts between segments, but overlap is ${overlap}. ` +
        'Render the full timeline instead, or set the overlap to 0.',
    );
  }

  const segAbs = path.resolve(root, segmentDir);
  fs.mkdirSync(segAbs, { recursive: true });

  for (const s of segments) {
    const file = path.join(segAbs, `${s.name}.mp4`);
    const stale = !fs.existsSync(file);
    if (!matches(filters, s.name, s.id) && !stale) continue;
    if (stale && filters.length) log(`${s.name}: no cached segment, rendering`);

    process.stdout.write(`${s.name} (${s.id}) ... `);
    render({
      root,
      entry,
      composition: s.id,
      out: path.relative(root, file),
      props,
      concurrency,
      crf,
    });
    log('ok');
  }

  // Concat demuxer requires identical codec and timebase across inputs, which
  // holds because every segment came from the same composition settings and the
  // same encoder invocation.
  const listing = path.join(segAbs, 'concat.txt');
  fs.writeFileSync(listing, segments.map((s) => `file '${s.name}.mp4'`).join('\n') + '\n');

  const final = path.resolve(root, out);
  execFileSync(ffmpegPath(root), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', listing,
    '-c', 'copy', final,
  ]);

  return final;
}

// Guards against the failure renderSegmented is built to avoid. A boundary that
// opens on black means a segment faded in over nothing, so the cut is wrong even
// though both the render and the concat reported success.
export function assertNoBlackFrames(root, file) {
  // blackdetect reports on stderr and ffmpeg still exits 0, so the result has to
  // be read from a successful run rather than from a thrown error.
  const r = spawnSync(
    ffmpegPath(root),
    ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=0.02:pic_th=0.90:pix_th=0.10', '-f', 'null', '-'],
    { encoding: 'utf-8' },
  );
  const hits = [...(r.stderr ?? '').matchAll(/black_start:([\d.]+)/g)].map((m) => m[1]);
  if (hits.length) {
    throw new Error(`Black frames at ${hits.join('s, ')}s in ${path.basename(file)}`);
  }
}

export const sizeMB = (file) => (fs.statSync(file).size / 1024 / 1024).toFixed(1);
