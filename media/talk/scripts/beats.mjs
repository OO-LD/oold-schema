// The beat list, derived from src/timeline.json rather than maintained beside
// it. A hand-written list of frame numbers goes stale the first time a segment
// is retimed, and the beat it stops covering is exactly the one nobody looks at
// again.
//
// Each beat is sampled at its midpoint, which is past every entry animation and
// before the next cut.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const timeline = JSON.parse(
  fs.readFileSync(path.join(root, 'src/timeline.json'), 'utf-8'),
);

const pad = (n) => String(n).padStart(2, '0');

// Beats of one segment, as `{ name, frame }` with the frame local to that
// segment's own composition.
export const beatsOf = (segment) => {
  let cursor = 0;
  return segment.beats.map((b, i) => {
    const from = cursor;
    cursor += b.len;
    return {
      name: `${segment.id.toLowerCase()}-${pad(i + 1)}-${b.name}`,
      frame: from + Math.floor(b.len / 2),
      segment: segment.id,
    };
  });
};

export const allBeats = () => timeline.segments.flatMap(beatsOf);

export const durationOf = (segment) => segment.beats.reduce((sum, b) => sum + b.len, 0);

export const cut = (scope) =>
  scope === 'core'
    ? timeline.segments.filter((s) => s.scope === 'core')
    : timeline.segments;

export const totalOf = (scope) => cut(scope).reduce((sum, s) => sum + durationOf(s), 0);

export const clock = (frames) => {
  const total = Math.round(frames / timeline.fps);
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
};
