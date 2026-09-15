// Shared design system for the OO-LD tutorial series. Episodes import from here
// and must not redefine colours, type sizes or fonts; the series has to read as
// one thing.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Frames a scene keeps rendering past its nominal end so it cross-dissolves with
// the next one instead of dipping to an empty background.
export const OVERLAP = 14;
// Two palettes. The brand hues are the same mark in both, but #0555AC and
// #5E2FA3 fall to 1.75 and 1.45 contrast on a dark background, which is unreadable
// at code-block size, so the dark variant lightens those to clear 4.5:1. Values
// derived by measurement, not by eye.
const LIGHT = {
  bg: '#FAFAF8',
  ink: '#101010',
  muted: '#6B6B6B',
  hairline: '#E2E0DA',
  panel: '#FFFFFF',
  oold: '#FBAC13',
  validate: '#0555AC',
  code: '#009933',
  graph: '#5E2FA3',
  // Semantic aliases: the series names the two standards, not the icons.
  schema: '#0555AC',
  context: '#5E2FA3',
  doc: '#D2000C',
  store: '#FF6600',
  oold_ink: '#8A5A00',
  schema_wash: '#0555AC12',
  context_wash: '#5E2FA312',
  oold_wash: '#FBAC1326',
  codeString: '#4B4B47',
  codePunct: '#A9A9A2',
  codePlain: '#7C7C76',
  shadow: 'rgba(16,16,16,0.06)',
};

const DARK: typeof LIGHT = {
  bg: '#16161A',
  ink: '#F2F2EE',
  muted: '#A0A09A',
  hairline: '#34343A',
  panel: '#1E1E24',
  oold: '#FBAC13',
  validate: '#0B7CF8',
  code: '#009933',
  graph: '#976DD5',
  schema: '#0B7CF8',
  context: '#976DD5',
  doc: '#FF010F',
  store: '#FF6600',
  oold_ink: '#FBAC13',
  schema_wash: '#0B7CF820',
  context_wash: '#976DD520',
  oold_wash: '#FBAC1326',
  codeString: '#C9C9C2',
  codePunct: '#6E6E76',
  codePlain: '#8A8A92',
  shadow: 'rgba(0,0,0,0.45)',
};

export type ThemeName = 'light' | 'dark';

// Mutated once per render pass by <Explainer> before any child reads it. Every
// consumer reads colors.x inside its own render, so the swap propagates; nothing
// captures a colour at module scope.
export const colors = { ...LIGHT };
export const brand = colors;

export const applyTheme = (name: ThemeName): void => {
  Object.assign(colors, name === 'dark' ? DARK : LIGHT);
};

export const fonts = {
  sans: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const type = {
  kicker: { size: 26, weight: 600, tracking: 4 },
  headline: { size: 82, weight: 700, leading: 1.24 },
  headlineSm: { size: 60, weight: 700, leading: 1.28 },
  caption: { size: 36, weight: 400, leading: 1.4 },
  body: { size: 29, weight: 400, leading: 1.45 },
  label: { size: 24, weight: 600, tracking: 1 },
  code: { size: 27, leading: 1.62 },
};

export const layout = {
  padX: 160,
  padY: 110,
};
