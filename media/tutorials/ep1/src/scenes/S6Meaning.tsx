import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Kicker } from '../../../shared/components/Type';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { IconGraph } from '../../../shared/components/Icons';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { Arrow, Chip, SceneTitle } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S6');

export const S6Meaning: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.meaning.kicker}</Kicker>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconGraph size={64} style={{ opacity: fadeIn(frame, 0, 18) }} />
        <SceneTitle delay={6}>{copy.meaning.title}</SceneTitle>
      </div>

      <div style={{ height: 30 }} />
      <div style={{ opacity: fadeIn(frame, 24, 16) }}>
        <CodeBlock
          code={copy.meaning.code}
          groupOf={() => 'context'}
          reveal={progress(frame, 30, 100)}
        />
      </div>

      <div style={{ height: 38 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <Chip
          text={copy.meaning.mapFrom}
          delay={170}
          color={brand.graph}
          border={`${brand.graph}33`}
        />
        <Arrow delay={184} width={96} color={brand.graph} />
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: type.code.size,
            color: brand.graph,
            ...enterUp(frame, 202, 18, 12),
          }}
        >
          {copy.meaning.mapTo}
        </div>
      </div>

      <div style={{ height: 34 }} />
      <div
        style={{
          fontSize: type.body.size,
          lineHeight: type.body.leading,
          color: colors.muted,
          maxWidth: 1360,
          ...enterUp(frame, 258, 20, 18),
        }}
      >
        {copy.meaning.mapNote}
      </div>
    </Stage>
  );
};
