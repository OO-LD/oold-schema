// The cut, derived from src/timeline.json.
//
// The table is JSON rather than TypeScript because scripts/check-budget.mjs and
// scripts/stills.mjs read it too, and node cannot import a .ts file on the node
// version CI pins. One table, three readers, no second copy of the frame numbers.
//
// Segments hard-cut. Nothing cross-dissolves across a segment boundary, which is
// what lets each segment render as its own composition (media/kit/rendiv.mjs,
// `renderSegmented`) and what lets a speaker advance them by hand instead of
// racing a fixed timeline. Beats inside a segment also hard-cut and carry their
// own entry animation.
import table from './timeline.json';

export const FPS = table.fps;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// 12 minutes of speaking at 30 fps, the MSE 2026 lecture slot before questions.
// scripts/check-budget.mjs fails if the conference cut exceeds it.
export const BUDGET = table.budgetFrames;

// Three kinds of claim. `built` is a present fact about a published artefact,
// `underway` is a public repository with the status its own authors give it, and
// `argue` is a position the talk takes. A slide carries exactly one of them.
export type Tier = 'built' | 'underway' | 'argue' | 'none';
export type Scope = 'core' | 'mse';

export type Beat = {
  name: string;
  len: number;
  from: number;
  tier: Tier;
};

export type Segment = {
  id: string;
  scope: Scope;
  tier: Tier;
  title: string;
  duration: number;
  beats: Beat[];
};

// A beat inherits its segment's tier unless it overrides it. A segment that
// argues a position can still rest one beat on something already built, and the
// mark on screen has to say so rather than colouring the whole slide by its
// loudest claim.
const toSegment = (s: (typeof table.segments)[number]): Segment => {
  let cursor = 0;
  const beats = s.beats.map((b) => {
    const from = cursor;
    cursor += b.len;
    return {
      name: b.name,
      len: b.len,
      from,
      tier: (('tier' in b ? b.tier : s.tier) as Tier) ?? 'none',
    };
  });
  return {
    id: s.id,
    scope: s.scope as Scope,
    tier: s.tier as Tier,
    title: s.title,
    duration: cursor,
    beats,
  };
};

export const segments: Segment[] = table.segments.map(toSegment);

export const segmentById = (id: string): Segment => {
  const segment = segments.find((s) => s.id === id);
  if (!segment) throw new Error(`Unknown segment ${id}`);
  return segment;
};

export type Placed = Segment & { from: number };

const place = (list: Segment[]): Placed[] => {
  let cursor = 0;
  return list.map((s) => {
    const from = cursor;
    cursor += s.duration;
    return { ...s, from };
  });
};

// The conference cut: the MSE title card and acknowledgement wrapped around the
// core. The core cut: the same segments with nothing naming a conference, which
// is the one that belongs on oo-ld.org.
export const mseCut = place(segments);
export const coreCut = place(segments.filter((s) => s.scope === 'core'));

const total = (list: Placed[]): number =>
  list.reduce((sum, s) => sum + s.duration, 0);

export const MSE_DURATION = total(mseCut);
export const CORE_DURATION = total(coreCut);
