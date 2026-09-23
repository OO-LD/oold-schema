import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from './Stage';
import { colors, fonts, layout, type } from '../theme';
import { segmentById, Tier } from '../timeline';
import { explain as explainCopy, tiers } from '../copy';
import { view } from '../view';
import { enterUp, fadeIn } from '../lib/motion';

// The mark that separates what is built from what is under way from what is
// argued.
//
// Filled, then outlined, then outlined and dashed: the three read as a gradient
// of how settled a claim is, in that order. It is a shape difference before it
// is a colour difference, so it survives both palettes and a projector that eats
// colour, and the word is written out either way.
export const TierBadge: React.FC<{ tier: Tier; size?: number }> = ({ tier, size }) => {
  if (tier === 'none') return null;
  const fontSize = size ?? type.label.size;
  const ink = tier === 'argue' ? colors.oold_ink : colors.ink;
  return (
    <div
      style={{
        fontSize,
        fontWeight: 600,
        letterSpacing: 2.4,
        textTransform: 'uppercase',
        padding: `${Math.round(fontSize * 0.38)}px ${Math.round(fontSize * 0.84)}px`,
        borderRadius: 999,
        border: `2px ${tier === 'argue' ? 'dashed' : 'solid'} ${ink}`,
        background: tier === 'built' ? colors.ink : 'transparent',
        color: tier === 'built' ? colors.bg : ink,
        whiteSpace: 'nowrap',
      }}
    >
      {tiers[tier]}
    </div>
  );
};

const TopBar: React.FC<{ tier: Tier; kicker?: string }> = ({ tier, kicker }) => (
  <div
    style={{
      position: 'absolute',
      top: 62,
      left: layout.padX,
      right: layout.padX,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 40,
    }}
  >
    {/* Always present, so a segment without a mark still puts its kicker on the
        right rather than sliding it left into the space-between gap. */}
    <div>
      <TierBadge tier={tier} />
    </div>
    <div
      style={{
        fontSize: type.kicker.size,
        fontWeight: type.kicker.weight,
        letterSpacing: type.kicker.tracking,
        textTransform: 'uppercase',
        color: colors.muted,
        textAlign: 'right',
      }}
    >
      {kicker ?? ''}
    </div>
  </div>
);

// The one line that presentation mode drops. It sits absolutely at the foot of
// the frame, so the slide above it is laid out identically in both cuts and a
// beat's frame number means the same thing in either.
const ExplainLine: React.FC<{ text?: string; from: number }> = ({ text, from }) => {
  const frame = useFrame();
  if (view.mode !== 'explain' || !text) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 58,
        display: 'flex',
        justifyContent: 'center',
        opacity: fadeIn(frame, from + 10, 18),
      }}
    >
      <div
        style={{
          maxWidth: 1420,
          fontSize: type.body.size,
          lineHeight: 1.44,
          color: colors.muted,
          borderTop: `2px solid ${colors.hairline}`,
          paddingTop: 20,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// One segment: the chrome, the beats, and the explanatory line for whichever
// beat is on screen.
//
// Beats are given in the same order as src/timeline.json names them, and their
// lengths come from there rather than from arithmetic inside the scene, so
// retiming is one edit in one file. They hard-cut: each beat animates its own
// content in and the previous one is simply gone, which is what a slide does and
// what keeps a segment renderable on its own.
export const SegmentFrame: React.FC<{
  id: string;
  kicker?: string;
  children: React.ReactNode;
}> = ({ id, kicker, children }) => {
  const frame = useFrame();
  const segment = segmentById(id);
  const beats = React.Children.toArray(children);

  if (beats.length !== segment.beats.length) {
    throw new Error(
      `Segment ${id} renders ${beats.length} beats but src/timeline.json declares ` +
        `${segment.beats.length}. The two have to agree or the cut silently retimes.`,
    );
  }

  const last = segment.beats[segment.beats.length - 1];
  const active = segment.beats.find((b) => frame >= b.from && frame < b.from + b.len) ?? last;

  return (
    <Stage padY={150}>
      <TopBar tier={active.tier} kicker={kicker} />
      {segment.beats.map((beat, i) => (
        <Sequence key={beat.name} from={beat.from} durationInFrames={beat.len} layout="none">
          {beats[i]}
        </Sequence>
      ))}
      <ExplainLine text={explainCopy[id]?.[active.name]} from={active.from} />
    </Stage>
  );
};

// A citation under a claim: where the thing on screen can be looked up. Muted
// and small, because it is for the person who writes it down, not for the room.
export const Cite: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 23,
        color: colors.muted,
        ...enterUp(frame, delay, 20, 12),
      }}
    >
      {children}
    </div>
  );
};
