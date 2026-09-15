import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Headline, Kicker, Rule } from '../../../shared/components/Type';
import { IconOOLD } from '../../../shared/components/Icons';
import { colors, fonts, OVERLAP, type } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { copy } from '../copy';
import { sceneById } from '../timeline';
import { Spacer, TopKicker } from './parts';

const scene = sceneById('S10');
const A = 290;
const B = scene.duration - A;

// Resolved at render time: applyTheme swaps the palette after this module is
// imported, so a value captured here would stay light in the dark render.
const rowColor = () => [colors.schema, colors.schema, colors.context, colors.schema];

const Row: React.FC<{ code: string; note: string; color: string; delay: number }> = ({
  code,
  note,
  color,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 34,
        width: 830,
        textAlign: 'left',
        ...enterUp(frame, delay, 20, 18),
      }}
    >
      <div
        style={{
          width: 430,
          flexShrink: 0,
          fontFamily: fonts.mono,
          fontSize: 30,
          fontWeight: 600,
          color,
          whiteSpace: 'pre',
        }}
      >
        {code}
      </div>
      <div style={{ fontSize: 31, color: colors.muted }}>{note}</div>
    </div>
  );
};

const BeatRows: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <TopKicker color={colors.oold_ink}>{copy.close.kicker}</TopKicker>

      <IconOOLD size={104} style={{ opacity: fadeIn(frame, 0, 16) }} />
      <Spacer h={40} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {copy.close.rows.map((r, i) => (
          <Row key={r.code} code={r.code} note={r.note} color={rowColor()[i]} delay={10 + i * 20} />
        ))}
      </div>
    </>
  );
};

// The handoff card of the series: amber rule, episode kicker, headline.
const BeatNext: React.FC = () => (
  <>
    <Rule delay={6} width={260} color={colors.oold} />
    <Spacer h={30} />
    <Kicker delay={20} color={colors.oold_ink}>
      {copy.close.nextKicker}
    </Kicker>
    <Headline groups={copy.close.next} delay={36} size={type.headline.size} maxWidth={1500} />
  </>
);

export const S10Recap: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatRows />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatNext />
      </Sequence>
    </Stage>
  );
};
