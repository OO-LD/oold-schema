import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../components/Stage';
import { Headline, Kicker } from '../components/Type';
import { IconOOLD, icons } from '../components/Icons';
import { copy } from '../copy';
import { brand, colors, OVERLAP, sceneById } from '../theme';
import { enterUp, fadeIn, pop, sceneOpacity } from '../lib/motion';

const scene = sceneById('S5');
const P1 = 200;
const P2 = 160;
const P3 = scene.duration - P1 - P2;

const BeatStory: React.FC = () => (
  <>
    <Kicker color={colors.muted}>{copy.proof.kicker}</Kicker>
    <Headline groups={copy.proof.story} delay={16} stagger={18} size={56} maxWidth={1480} />
  </>
);

const BeatFacts: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  return (
    <div style={{ display: 'flex', gap: 46 }}>
      {copy.proof.facts.map((f, i) => {
        const Icon = icons[f.icon];
        const s = pop(frame, fps, i * 12, 15);
        return (
          <div
            key={f.label}
            style={{
              width: 356,
              opacity: fadeIn(frame, i * 12, 14),
              transform: `translateY(${(1 - s) * 24}px)`,
            }}
          >
            <Icon size={126} />
            <div style={{ fontSize: 31, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>
              {f.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BeatEnd: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 14);

  return (
    <div>
      <IconOOLD
        size={196}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div
        style={{
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -2,
          color: brand.oold,
          marginTop: 4,
          ...enterUp(frame, 20, 24, 22),
        }}
      >
        {copy.proof.site}
      </div>
      <div
        style={{
          fontSize: 40,
          color: colors.muted,
          marginTop: 14,
          ...enterUp(frame, 40, 22, 18),
        }}
      >
        {copy.proof.repo}
      </div>
    </div>
  );
};

export const S5Proof: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)} justify="center">
      <Sequence from={0} durationInFrames={P1} layout="none">
        <BeatStory />
      </Sequence>
      <Sequence from={P1} durationInFrames={P2} layout="none">
        <BeatFacts />
      </Sequence>
      <Sequence from={P1 + P2} durationInFrames={P3 + OVERLAP} layout="none">
        <BeatEnd />
      </Sequence>
    </Stage>
  );
};
