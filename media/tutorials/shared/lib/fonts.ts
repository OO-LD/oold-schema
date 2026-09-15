import { abortRender, holdRender, releaseRender } from '@rendiv/core';
import '../fonts.css';

// @font-face declarations load lazily, so the first frames would capture before
// the faces are ready. Force every weight the video uses, and hold capture until
// they resolve.
const FACES = [
  '400 30px Inter',
  '600 30px Inter',
  '700 30px Inter',
  '400 30px "JetBrains Mono"',
  '600 30px "JetBrains Mono"',
];

export const loadFonts = (): void => {
  if (typeof document === 'undefined' || !document.fonts) return;

  const handle = holdRender('fonts');
  Promise.all(FACES.map((f) => document.fonts.load(f)))
    .then(() => document.fonts.ready)
    .then(() => {
      const missing = FACES.filter((f) => !document.fonts.check(f));
      if (missing.length) {
        abortRender(`Fonts failed to load: ${missing.join(', ')}`);
        return;
      }
      releaseRender(handle);
    })
    .catch((err) => abortRender(`Font loading failed: ${String(err)}`));
};
