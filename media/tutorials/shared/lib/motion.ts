import { Easing, interpolate, spring } from '@rendiv/core';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const fadeIn = (frame: number, start = 0, len = 15) =>
  interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: Easing.out(Easing.ease) });

export const fadeOut = (frame: number, start: number, len = 15) =>
  interpolate(frame, [start, start + len], [1, 0], { ...clamp, easing: Easing.in(Easing.ease) });

// Fades out over the OVERLAP frames *after* the nominal duration, so the outgoing
// and incoming scenes dissolve through each other.
export const sceneOpacity = (frame: number, duration: number, len = 14) =>
  Math.min(fadeIn(frame, 0, len), fadeOut(frame, duration, len));

export const rise = (frame: number, start = 0, len = 20, distance = 28) =>
  interpolate(frame, [start, start + len], [distance, 0], {
    ...clamp,
    easing: Easing.easeOut,
  });

export const pop = (frame: number, fps: number, delay = 0, damping = 14) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 120, mass: 0.9 } });

export const progress = (frame: number, start: number, len: number) =>
  interpolate(frame, [start, start + len], [0, 1], clamp);

export const window = (frame: number, from: number, to: number, len = 12) =>
  Math.min(fadeIn(frame, from, len), fadeOut(frame, to - len, len));

export type Enter = { opacity: number; transform: string };

export const enterUp = (frame: number, delay = 0, len = 20, distance = 28): Enter => ({
  opacity: fadeIn(frame, delay, len),
  transform: `translateY(${rise(frame, delay, len, distance)}px)`,
});
