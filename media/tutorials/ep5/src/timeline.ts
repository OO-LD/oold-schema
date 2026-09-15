// Scene table for episode 5. Retiming the episode is one edit here: every scene
// reads its own duration through sceneById, and Episode.tsx lays the Sequences
// out from the same array.
//
// The order is the argument the episode makes. Validation establishes that the
// document is correct, the binding shows what the objects do once it is, and
// the query DSL closes the technical part with the language that asks the
// graph a question. Serialisation and code generation sit between the binding
// and the DSL, because both are things you do with objects that already work.
//
// Binding and DSL carry the longest budgets on purpose; they are the two parts
// of the library worth an episode of their own.

export type Scene = {
  id: string;
  title: string;
  from: number;
  duration: number;
};

const durations: { id: string; title: string; duration: number }[] = [
  { id: 'S1', title: 'Open', duration: 420 },
  { id: 'S2', title: 'Validate', duration: 960 },
  { id: 'S3', title: 'Declare', duration: 1000 },
  { id: 'S4', title: 'Binding', duration: 1290 },
  { id: 'S5', title: 'JSON-LD', duration: 750 },
  { id: 'S6', title: 'Codegen', duration: 690 },
  { id: 'S7', title: 'Query DSL', duration: 1250 },
  { id: 'S8', title: 'Close', duration: 660 },
];

let cursor = 0;
export const scenes: Scene[] = durations.map((s) => {
  const scene = { ...s, from: cursor };
  cursor += s.duration;
  return scene;
});

export const TOTAL = cursor;

export const sceneById = (id: string): Scene => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene ${id}`);
  return scene;
};
