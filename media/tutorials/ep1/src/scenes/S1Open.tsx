import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline, Kicker, Rule } from '../../../shared/components/Type';
import { IconOOLD } from '../../../shared/components/Icons';
import { brand, colors } from '../../../shared/theme';
import { pop, sceneOpacity } from '../../../shared/lib/motion';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S1');

export const S1Open: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4);

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      {/* The shared Kicker carries a 34px bottom margin, so the icon gets the same
          padding underneath or the two do not share a centre line. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', paddingBottom: 34 }}>
          <IconOOLD
            size={86}
            style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
          />
        </div>
        <Kicker color={brand.oold} delay={14}>
          {copy.open.kicker}
        </Kicker>
      </div>

      <Headline groups={copy.open.groups} delay={34} stagger={26} maxWidth={1480} />

      <div style={{ height: 44 }} />
      <Rule delay={126} width={200} color={colors.ink} />
      <div style={{ height: 38 }} />

      <Caption delay={150} maxWidth={1200}>
        {copy.open.caption}
      </Caption>
    </Stage>
  );
};
