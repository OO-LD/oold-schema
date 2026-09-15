import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Headline, Kicker } from '../../../shared/components/Type';
import { IconOOLD } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP } from '../../../shared/theme';
import { enterUp, fadeIn, pop, sceneOpacity } from '../../../shared/lib/motion';
import { copy } from '../copy';
import { sceneById } from '../timeline';
import { Chip, Note } from '../components/Parts';

const scene = sceneById('S1');
const A = 210;
const B = scene.duration - A;

const chipColor = (text: string): string =>
  text.startsWith('@') ? brand.graph : brand.validate;

// The two moves are neutral ink. Purple and blue stay reserved for JSON-LD and
// JSON Schema; the tag word, the title and the side of the frame carry the
// distinction between "has a" and "is a".

const BeatTitle: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);
  return (
  <>
    <IconOOLD
      size={92}
      style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
    />
    <div style={{ height: 24 }} />
    <Kicker color={colors.oold_ink}>{copy.open.kicker}</Kicker>
    <Headline groups={copy.open.headline} delay={8} maxWidth={1500} />
    <div style={{ height: 46 }} />
    <div style={{ display: 'flex', gap: 16 }}>
      {copy.open.chips.map((c, i) => (
        <Chip key={c} text={c} color={chipColor(c)} delay={62 + i * 8} />
      ))}
    </div>
    <div style={{ height: 34 }} />
    <Note delay={112} size={32} maxWidth={1200}>
      {copy.open.recap}
    </Note>
  </>
  );
};

const MoveCard: React.FC<{
  tag: string;
  line: string;
  example: string;
  color: string;
  delay: number;
}> = ({ tag, line, example, color, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 660,
        background: colors.panel,
        border: `3px solid ${color}2E`,
        borderRadius: 20,
        padding: '34px 38px',
        textAlign: 'left',
        ...enterUp(frame, delay, 22, 22),
      }}
    >
      <div style={{ fontSize: 52, fontWeight: 700, color, letterSpacing: -0.6 }}>{tag}</div>
      <div style={{ height: 14 }} />
      <div style={{ fontSize: 30, lineHeight: 1.35, color: colors.ink, minHeight: 82 }}>{line}</div>
      <div style={{ height: 18 }} />
      <Chip text={example} color={color} delay={delay + 22} size={24} />
    </div>
  );
};

const BeatMoves: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4, 15);
  return (
    <>
      <IconOOLD
        size={104}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 30 }} />
      <div style={{ display: 'flex', gap: 44, alignItems: 'stretch' }}>
        <MoveCard
          tag={copy.open.moves[0].tag}
          line={copy.open.moves[0].line}
          example={copy.open.moves[0].example}
          color={colors.ink}
          delay={16}
        />
        <MoveCard
          tag={copy.open.moves[1].tag}
          line={copy.open.moves[1].line}
          example={copy.open.moves[1].example}
          color={colors.ink}
          delay={34}
        />
      </div>
      <div style={{ height: 40 }} />
      <div style={{ opacity: fadeIn(frame, 92, 20) }}>
        <Note delay={92} size={32} color={colors.ink} maxWidth={1300}>
          {copy.open.movesNote}
        </Note>
      </div>
    </>
  );
};

export const S1Open: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatTitle />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatMoves />
      </Sequence>
    </Stage>
  );
};
