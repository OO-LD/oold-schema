import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline } from '../../../shared/components/Type';
import { Group } from '../../../shared/components/CodeBlock';
import { IconValidate } from '../../../shared/components/Icons';
import { colors, fonts, OVERLAP, type } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, ooldKeywordsExcerpt } from '../copy';
import { sceneById } from '../timeline';
import { FileLabel, FileView, Spacer, TopKicker } from './parts';

const scene = sceneById('S8');
const A = 210;
const B = scene.duration - A;

const oold = (): Group => 'oold';

// The keywords the caveat is about, taken from the file the previous scene walked
// through, so the subject of the sentence is on screen while it is made.
const BeatProblem: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconValidate size={50} />
        <FileLabel>{copy.strict.excerptLabel}</FileLabel>
      </div>
      <FileView
        code={ooldKeywordsExcerpt}
        groupOf={oold}
        fontSize={24}
        reveal={progress(frame, 4, 30)}
        wash={{ oold: progress(frame, 22, 20) }}
      />
      <Spacer h={30} />
      <Caption delay={40} size={30} color={colors.oold_ink} maxWidth={1440}>
        {copy.strict.qualifies}
      </Caption>
      <Spacer h={24} />
      <Caption delay={64} size={31} color={colors.muted} maxWidth={1320}>
        {copy.strict.lead}
      </Caption>
      <Spacer h={26} />
      <Headline groups={copy.strict.problem} delay={88} size={type.headlineSm.size} maxWidth={1400} />
      <Spacer h={20} />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 27,
          color: colors.schema,
          opacity: fadeIn(frame, 118, 18),
        }}
      >
        {copy.strict.example}
      </div>
    </>
  );
};

const FixCard: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 620,
        minHeight: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.panel,
        border: `3px solid ${colors.schema}22`,
        borderRadius: 20,
        padding: '28px 36px',
        fontSize: 32,
        lineHeight: 1.35,
        color: colors.ink,
        opacity: fadeIn(frame, delay, 20),
      }}
    >
      {text}
    </div>
  );
};

const BeatFix: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Caption delay={0} size={31} color={colors.muted} maxWidth={1340}>
        {copy.strict.problem.join(' ')}
      </Caption>
      <Spacer h={12} />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 25,
          color: colors.schema,
          opacity: fadeIn(frame, 8, 16),
        }}
      >
        {copy.strict.example}
      </div>
      <Spacer h={40} />
      <Caption delay={22} size={33} color={colors.ink} maxWidth={1340}>
        {copy.strict.fixLead}
      </Caption>
      <Spacer h={34} />
      <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
        {copy.strict.fixes.map((f, i) => (
          <FixCard key={f} text={f} delay={40 + i * 24} />
        ))}
      </div>
      <Spacer h={44} />
      <Caption delay={100} size={33} color={colors.ink} maxWidth={1320}>
        {copy.strict.close}
      </Caption>
    </>
  );
};

export const S8Strict: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <TopKicker color={colors.oold_ink}>{copy.strict.kicker}</TopKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatProblem />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatFix />
      </Sequence>
    </Stage>
  );
};
