export type Scene = {
  id: string;
  title: string;
  from: number;
  duration: number;
};

const table: { id: string; title: string; duration: number }[] = [
  { id: 'S1', title: 'Open', duration: 420 },
  { id: 'S2', title: 'Has a', duration: 1080 },
  { id: 'S3', title: 'Is a', duration: 1020 },
  { id: 'S4', title: 'The difference', duration: 390 },
  { id: 'S5', title: 'Reflection', duration: 1080 },
  { id: 'S5b', title: 'Context merge', duration: 240 },
  { id: 'S6', title: 'Closing', duration: 450 },
  { id: 'S7', title: 'Together', duration: 680 },
];

let cursor = 0;
export const scenes: Scene[] = table.map((s) => {
  const from = cursor;
  cursor += s.duration;
  return { ...s, from };
});

export const DURATION = cursor;

export const sceneById = (id: string): Scene => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene ${id}`);
  return scene;
};
