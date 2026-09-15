// The scene table. Retiming the episode is one edit here.

export type Scene = {
  id: string;
  title: string;
  from: number;
  duration: number;
};

// The strict-mode caveat (S8) runs after the Person walkthrough (S9), so the
// x-oold-* keywords it talks about are on screen before it names them.
const table: Array<[string, string, number]> = [
  ['S1', 'Open', 330],
  ['S2', 'The file', 450],
  ['S3', '$schema', 480],
  ['S4', '$id', 450],
  ['S5', '@context', 690],
  ['S6', 'Structure keywords', 450],
  ['S7', 'Two roles', 540],
  ['S9', 'Person', 780],
  ['S8', 'Strict mode', 480],
  ['S10', 'Recap', 480],
];

let cursor = 0;
export const scenes: Scene[] = table.map(([id, title, duration]) => {
  const from = cursor;
  cursor += duration;
  return { id, title, from, duration };
});

export const DURATION = cursor;

export const sceneById = (id: string): Scene => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene ${id}`);
  return scene;
};
