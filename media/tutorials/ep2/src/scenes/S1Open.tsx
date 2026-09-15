import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline, Kicker } from '../../../shared/components/Type';
import { IconOOLD } from '../../../shared/components/Icons';
import { brand, colors, type } from '../../../shared/theme';
import { enterUp, pop, sceneOpacity } from '../../../shared/lib/motion';
import { copy } from '../copy';
import { sceneById } from '../timeline';
import { Spacer } from './parts';

const scene = sceneById('S1');

export const S1Open: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4);

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 6 }}>
        <IconOOLD
          size={86}
          style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
        />
        <Kicker color={brand.oold} delay={8}>
          {copy.open.kicker}
        </Kicker>
      </div>

      <Headline groups={copy.open.groups} delay={22} stagger={24} maxWidth={1500} />

      <Spacer h={34} />
      <div
        style={{
          height: 5,
          width: 170,
          background: brand.oold,
          borderRadius: 3,
          ...enterUp(frame, 96, 20, 0),
        }}
      />
      <Spacer h={32} />

      <Caption delay={118} color={colors.muted} maxWidth={1500}>
        {copy.open.recap}
      </Caption>

      <Spacer h={42} />
      <Headline
        groups={[copy.open.question]}
        delay={196}
        size={type.headlineSm.size}
        maxWidth={1300}
      />
    </Stage>
  );
};
