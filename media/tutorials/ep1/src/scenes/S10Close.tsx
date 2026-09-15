import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Headline, Kicker, Rule } from '../../../shared/components/Type';
import { IconOOLD } from '../../../shared/components/Icons';
import { brand, colors, type } from '../../../shared/theme';
import { enterUp, pop, sceneOpacity } from '../../../shared/lib/motion';
import { SceneTitle, Statement } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S10');

export const S10Close: React.FC = () => {
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
            size={92}
            style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
          />
        </div>
        <Kicker color={brand.oold} delay={14}>
          {copy.close.kicker}
        </Kicker>
      </div>

      <SceneTitle delay={40} size={type.headline.size} maxWidth={1400}>
        {copy.close.title}
      </SceneTitle>

      <div style={{ height: 40 }} />
      <Statement text={copy.close.statement} delay={120} maxWidth={1380} />

      <div style={{ height: 16 }} />
      <div
        style={{
          fontSize: type.body.size,
          color: colors.muted,
          ...enterUp(frame, 180, 20, 16),
        }}
      >
        {copy.close.promise}
      </div>

      <div style={{ height: 44 }} />
      <Rule delay={240} width={260} />
      <div style={{ height: 30 }} />
      <Kicker delay={258} color={colors.oold_ink}>
        {copy.close.nextKicker}
      </Kicker>
      <Headline groups={copy.close.next} delay={276} size={type.headlineSm.size} maxWidth={1300} />
    </Stage>
  );
};
