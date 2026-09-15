import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Headline, Kicker } from '../../../shared/components/Type';
import { IconGraph } from '../../../shared/components/Icons';
import { colors } from '../../../shared/theme';
import { fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { Note } from '../components/Parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S1');

export const S1Open: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <IconGraph size={92} style={{ opacity: fadeIn(frame, 0, 20), marginBottom: 26 }} />
      <Kicker delay={8} color={colors.oold_ink}>
        {copy.open.kicker}
      </Kicker>
      <Headline groups={copy.open.headline} delay={20} />

      <div style={{ height: 46 }} />
      <Note delay={150} maxWidth={1180}>
        {copy.open.recap}
      </Note>

      <div style={{ height: 16 }} />
      <Note delay={196} maxWidth={1180} color={colors.ink}>
        {copy.open.turn}
      </Note>

      <div style={{ height: 34 }} />
      <Note delay={262} maxWidth={1380} size={31} color={colors.oold_ink}>
        {copy.open.question}
      </Note>
    </Stage>
  );
};
