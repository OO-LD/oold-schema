import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Kicker } from '../../../shared/components/Type';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { IconGraph } from '../../../shared/components/Icons';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { SceneTitle, Statement } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S7');

export const S7Loose: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.loose.kicker}</Kicker>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconGraph size={64} style={{ opacity: fadeIn(frame, 0, 18) }} />
        <SceneTitle delay={6}>{copy.loose.title}</SceneTitle>
      </div>

      <div style={{ height: 30 }} />
      <div
        style={{
          fontSize: type.body.size,
          fontWeight: 600,
          color: colors.muted,
          ...enterUp(frame, 24, 18, 14),
        }}
      >
        {copy.loose.lead}
      </div>

      <div style={{ height: 20 }} />
      <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
        {copy.loose.cases.map((c, i) => (
          <div key={c} style={{ opacity: fadeIn(frame, 56 + i * 30, 18) }}>
            <CodeBlock code={c} groupOf={() => 'plain'} />
          </div>
        ))}
      </div>

      <div style={{ height: 22 }} />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: type.code.size,
          color: brand.graph,
          ...enterUp(frame, 150, 18, 14),
        }}
      >
        {copy.loose.verdict}
      </div>

      <div style={{ height: 18 }} />
      <div
        style={{
          fontSize: type.body.size,
          lineHeight: type.body.leading,
          color: colors.muted,
          maxWidth: 1420,
          ...enterUp(frame, 184, 20, 16),
        }}
      >
        {copy.loose.note}
      </div>

      <div style={{ height: 40 }} />
      <Statement
        text={copy.loose.statement}
        source={copy.loose.source}
        delay={220}
        maxWidth={1300}
      />
    </Stage>
  );
};
