import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Headline, Kicker } from '../../../shared/components/Type';
import { IconCode, IconOOLD } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP, type } from '../../../shared/theme';
import { fadeIn, pop, sceneOpacity } from '../../../shared/lib/motion';
import { MonoChip, SceneTitle, Statement } from '../components/Parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S9');
const A = 300;
const B = scene.duration - A;

const RecapRow: React.FC<{ term: string; text: string; delay: number }> = ({
  term,
  text,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left' }}>
      <div style={{ width: 260, display: 'flex', justifyContent: 'flex-end' }}>
        <MonoChip text={term} color={brand.graph} delay={delay} size={24} />
      </div>
      <div
        style={{
          fontSize: 29,
          color: colors.ink,
          width: 460,
          opacity: fadeIn(frame, delay + 10, 16),
        }}
      >
        {text}
      </div>
    </div>
  );
};

const BeatRecap: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      {/* The shared Kicker carries a 34px bottom margin, so the icon gets the
          same padding underneath or the two do not share a centre line. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 10 }}>
        <div style={{ display: 'flex', paddingBottom: 34 }}>
          <IconOOLD
            size={92}
            style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
          />
        </div>
        <Kicker color={brand.oold} delay={12}>
          {copy.close.kicker}
        </Kicker>
      </div>

      <SceneTitle size={type.headline.size} delay={30}>
        {copy.close.title}
      </SceneTitle>

      <div style={{ height: 40 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {copy.close.recap.map((r, i) => (
          <RecapRow key={r.term} term={r.term} text={r.text} delay={70 + i * 30} />
        ))}
      </div>

      <div style={{ height: 34 }} />
      <Statement
        text={copy.close.claim}
        source={copy.close.source}
        delay={180}
        maxWidth={1200}
        size={30}
      />
    </>
  );
};

const BeatNext: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4, 15);

  return (
    <>
      <IconCode
        size={120}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 34 }} />
      <Kicker delay={18} color={colors.oold_ink}>
        {copy.close.nextKicker}
      </Kicker>
      <Headline groups={copy.close.next} delay={32} size={type.headlineSm.size} maxWidth={1400} />
    </>
  );
};

export const S9Close: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatRecap />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatNext />
      </Sequence>
    </Stage>
  );
};
