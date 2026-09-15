import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline, Kicker, Rule } from '../../../shared/components/Type';
import { colors } from '../../../shared/theme';
import { sceneOpacity } from '../../../shared/lib/motion';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S9');

export const S9Consequence: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Kicker delay={0}>{copy.consequence.kicker}</Kicker>

      <Headline groups={copy.consequence.groups} delay={22} stagger={28} maxWidth={1560} />

      <div style={{ height: 42 }} />
      <Rule delay={112} width={180} color={colors.hairline} />
      <div style={{ height: 36 }} />

      <Caption delay={150} color={colors.muted} maxWidth={1360}>
        {copy.consequence.caption}
      </Caption>
    </Stage>
  );
};
