// Legibility arithmetic for the OO-LD video projects: contrast, type size at the
// size a video is actually watched, and how much text a frame asks a viewer to
// read in the time it is on screen.
//
// Pure functions only. Each project knows its own palette, its own type scale and
// its own timeline; none of that belongs here. What is identical everywhere is
// the arithmetic, and the fact that all three of these pass when measured on the
// declared values and fail when measured on what reaches the screen.
//
// A still looks fine in isolation. These are the questions a still cannot answer.

const hex = (c) => {
  const s = String(c).replace('#', '').trim();
  const full = s.length === 3 ? [...s].map((ch) => ch + ch).join('') : s;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`not a hex colour: ${c}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (colour) => {
  const [r, g, b] = hex(colour).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrastRatio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Composites `fg` over `bg` at `alpha`, returning the colour that actually
// reaches the screen.
//
// This is the one to reach for when a scene dims a layer to bring an overlay
// forward. The palette still declares the same two colours, so contrast measured
// on the declared values keeps passing, and a type-size floor keeps passing too
// because the type did not change size. What changed is the ink. Text set at a
// comfortable ratio against its background can land below the 3:1 non-text
// threshold once the layer carrying it is composited at 40% opacity, and the
// frame reads as blank on a projector while every declared check is green.
export function blend(fg, bg, alpha) {
  if (alpha < 0 || alpha > 1) throw new Error(`alpha out of range: ${alpha}`);
  const [f, b] = [hex(fg), hex(bg)];
  const mix = f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// WCAG 2.1 thresholds. `large` is 18.66px bold or 24px regular and above.
export const WCAG = { text: 4.5, large: 3, nonText: 3 };

export function assertContrast(pairs, min = WCAG.text) {
  const failed = pairs
    .map((p) => ({ ...p, ratio: contrastRatio(p.fg, p.bg) }))
    .filter((p) => p.ratio < (p.min ?? min));
  if (failed.length) {
    const lines = failed.map(
      (p) => `  ${p.name}: ${p.ratio.toFixed(2)}:1 (${p.fg} on ${p.bg}, needs ${p.min ?? min}:1)`,
    );
    throw new Error(`contrast below threshold:\n${lines.join('\n')}`);
  }
  return pairs.length;
}

// A video authored at 1920 is rarely watched at 1920. Inline on a page it is
// perhaps 800 wide, and every size on screen scales with it.
export const effectivePx = (px, renderWidth, embedWidth) => (px * embedWidth) / renderWidth;

// Raster assets bypass a type scale entirely. A logo strip is one image as far as
// the renderer is concerned, so a floor enforced on styled text says nothing about
// the strapline baked into it, which is routinely the smallest thing on the frame.
// Pass those in measured, in render-space pixels, alongside the styled sizes.
export function assertTypeFloor(sizes, { floorPx, renderWidth, embedWidth }) {
  const failed = sizes
    .map((s) => ({ ...s, effective: effectivePx(s.px, renderWidth, embedWidth) }))
    .filter((s) => s.effective < floorPx);
  if (failed.length) {
    const lines = failed.map(
      (s) => `  ${s.name}: ${s.px}px renders ${s.effective.toFixed(1)}px at ${embedWidth} wide`,
    );
    throw new Error(`below the ${floorPx}px floor at an ${embedWidth}px embed:\n${lines.join('\n')}`);
  }
  return sizes.length;
}

// Words per minute a viewer must sustain to finish a frame before it changes.
// `seconds` is the dwell of the fully built state, not the length of the scene:
// text that arrives late is read in the time that remains after it arrives.
export const readingLoad = (words, seconds) => (seconds > 0 ? (words / seconds) * 60 : Infinity);

// Unnarrated on-screen text sits comfortably around 160 to 200 wpm.
export const COMFORTABLE_WPM = { min: 160, max: 200 };

// Reports per state rather than per video, because the total hides the problem.
// A timeline can average inside the band while half its frames are three times
// over it and the other half hold a finished state with nothing arriving. The
// fix for that is redistribution, which a single average will never prompt.
export function readingLoadReport(states, ceiling = COMFORTABLE_WPM.max) {
  const rows = states
    .map((s) => ({ ...s, wpm: readingLoad(s.words, s.seconds) }))
    .sort((a, b) => b.wpm - a.wpm);
  const totalWords = states.reduce((n, s) => n + s.words, 0);
  const totalSeconds = states.reduce((n, s) => n + s.seconds, 0);
  return {
    rows,
    over: rows.filter((r) => r.wpm > ceiling),
    slack: rows.filter((r) => r.wpm < COMFORTABLE_WPM.min),
    overall: readingLoad(totalWords, totalSeconds),
  };
}
