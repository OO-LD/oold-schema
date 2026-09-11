import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../components/Stage';
import { Kicker, Headline, Caption } from '../components/Type';
import { IconOOLD } from '../components/Icons';
import { copy } from '../copy';
import { brand, colors, sceneById } from '../theme';
import { enterUp, sceneOpacity, pop } from '../lib/motion';
import { useCompositionConfig } from '@rendiv/core';

const scene = sceneById('S2');

export const S2Clarity: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4);

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 10 }}>
        <IconOOLD
          size={92}
          style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
        />
        <Kicker color={brand.oold} delay={10}>
          {copy.clarity.kicker}
        </Kicker>
      </div>

      <Headline groups={copy.clarity.groups} delay={26} stagger={26} maxWidth={1560} />

      <div style={{ height: 40 }} />
      <div
        style={{
          height: 5,
          width: 160,
          background: brand.oold,
          borderRadius: 3,
          ...enterUp(frame, 132, 20, 0),
        }}
      />
      <div style={{ height: 34 }} />

      <Caption delay={150} color={colors.muted} maxWidth={1300}>
        {copy.clarity.caption}
      </Caption>
    </Stage>
  );
};
