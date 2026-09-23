// Presentation mode versus self-explaining mode.
//
// The same deck is shown twice with different amounts of text. In front of an
// audience the speaker carries the argument, so a slide that also writes it out
// competes with him. On a website nobody is speaking, so the line has to be on
// screen or the slide says nothing.
//
// Only the explanatory line differs. Timing, layout and every other string are
// identical, so the two cuts cannot drift the way two decks would, and a beat's
// frame number means the same thing in both.
//
// Mutated once per render pass, above every segment, exactly like `applyTheme`.
// Every consumer reads `view.mode` inside its own render; a module-scope capture
// would freeze the default and the other cut would come out wrong with no error.

export type Mode = 'presentation' | 'explain';

export const view = { mode: 'presentation' as Mode };

export const applyMode = (mode: Mode): void => {
  view.mode = mode;
};
