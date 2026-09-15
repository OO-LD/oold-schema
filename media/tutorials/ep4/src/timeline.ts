// Scene table for episode 4. Durations are the single place to retime the cut;
// `from` is derived so a change never has to be propagated by hand.

export type Scene = {
  id: string;
  title: string;
  from: number;
  duration: number;
};

const table: { id: string; title: string; duration: number }[] = [
  { id: 'S1', title: 'Open', duration: 360 },
  { id: 'S2', title: 'The instance beside its schema', duration: 430 },
  { id: 'S3', title: 'Identity and type', duration: 690 },
  { id: 'S4', title: 'Expansion to triples', duration: 660 },
  { id: 'S5', title: 'Three value forms', duration: 600 },
  { id: 'S6', title: 'A typed reference', duration: 480 },
  { id: 'S7', title: 'Two documents, one graph', duration: 690 },
  { id: 'S8', title: 'Identification, versioning, resolution', duration: 980 },
  { id: 'S9', title: 'Close', duration: 470 },
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
