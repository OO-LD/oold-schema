// The talk has a slot, and a deck that overruns it is a defect rather than a
// style note. This prints the cut against the budget and fails if the
// conference cut exceeds it.
//
// The budget is the speaking time, not the slot: MSE 2026 gives a lecture 12
// minutes plus 3 minutes of questions, and the questions are not slides.
import { clock, cut, durationOf, timeline, totalOf } from './beats.mjs';

const rows = timeline.segments.map((s) => ({
  id: s.id,
  scope: s.scope,
  tier: s.tier,
  frames: durationOf(s),
  beats: s.beats.length,
  title: s.title,
}));

const width = (key, head) =>
  Math.max(head.length, ...rows.map((r) => String(r[key]).length));
const w = {
  id: width('id', 'id'),
  scope: width('scope', 'scope'),
  tier: width('tier', 'tier'),
  frames: width('frames', 'frames'),
};

console.log(
  `${'id'.padEnd(w.id)}  ${'scope'.padEnd(w.scope)}  ${'tier'.padEnd(w.tier)}  ` +
    `${'frames'.padStart(w.frames)}  time   beats  title`,
);
for (const r of rows) {
  console.log(
    `${r.id.padEnd(w.id)}  ${r.scope.padEnd(w.scope)}  ${r.tier.padEnd(w.tier)}  ` +
      `${String(r.frames).padStart(w.frames)}  ${clock(r.frames).padStart(5)}  ` +
      `${String(r.beats).padStart(5)}  ${r.title}`,
  );
}

const mse = totalOf('mse');
const core = totalOf('core');
const budget = timeline.budgetFrames;

console.log('');
console.log(`conference cut  ${mse} frames  ${clock(mse)}  (${cut('mse').length} segments)`);
console.log(`core cut        ${core} frames  ${clock(core)}  (${cut('core').length} segments)`);
console.log(`budget          ${budget} frames  ${clock(budget)}`);

if (mse > budget) {
  console.error(
    `\ncheck-budget: the conference cut is ${mse - budget} frames ` +
      `(${clock(mse - budget)}) over the ${clock(budget)} slot.`,
  );
  process.exit(1);
}

console.log(`\ncheck-budget: ${clock(budget - mse)} of headroom in the slot`);
