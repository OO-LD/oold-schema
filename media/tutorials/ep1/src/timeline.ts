// Scene table for episode 1. Durations are the single place to retime the cut;
// `from` is derived so a change never has to be propagated by hand.

export type Scene = {
  id: string;
  title: string;
  from: number;
  duration: number;
};

const table: { id: string; title: string; duration: number }[] = [
  { id: 'S1', title: 'Open', duration: 390 },
  { id: 'S2', title: 'One name, two meanings', duration: 690 },
  { id: 'S3', title: 'One thing, three names', duration: 600 },
  { id: 'S4', title: 'The schema passes both', duration: 690 },
  { id: 'S5', title: 'What a schema says', duration: 570 },
  // S6 and S7 are the JSON-LD side of the same argument S4 and S5 make about
  // JSON Schema, and run for the same length.
  { id: 'S6', title: 'A context supplies meaning', duration: 450 },
  { id: 'S7', title: 'A context constrains nothing', duration: 390 },
  { id: 'S8', title: 'Neither alone', duration: 600 },
  { id: 'S9', title: 'The consequence', duration: 450 },
  { id: 'S10', title: 'Both in one document', duration: 510 },
];

let cursor = 0;
export const scenes: Scene[] = table.map((s) => {
  const from = cursor;
  cursor += s.duration;
  return { id: s.id, title: s.title, duration: s.duration, from };
});

export const DURATION = cursor;

export const sceneById = (id: string): Scene => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene ${id}`);
  return scene;
};
