import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { colors } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { SceneKicker, SceneTitle, Statement } from '../components/Parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S5');

const Row: React.FC<{ name: string; sub: string; code: string; delay: number }> = ({
  name,
  sub,
  code,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', gap: 44, alignItems: 'center', textAlign: 'left' }}>
      <div style={{ width: 400, ...enterUp(frame, delay, 20, 16) }}>
        <div style={{ fontSize: 31, fontWeight: 700, color: colors.ink }}>{name}</div>
        <div style={{ fontSize: 24, color: colors.muted, marginTop: 4 }}>{sub}</div>
      </div>
      <div style={{ opacity: fadeIn(frame, delay + 10, 18) }}>
        <CodeBlock code={code} groupOf={() => 'plain'} fontSize={24} />
      </div>
    </div>
  );
};

export const S5Forms: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.forms.kicker}</SceneKicker>
      <SceneTitle>{copy.forms.title}</SceneTitle>

      <div style={{ height: 38 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {copy.forms.rows.map((r, i) => (
          <Row key={r.name} name={r.name} sub={r.sub} code={r.code} delay={40 + i * 110} />
        ))}
      </div>

      <div style={{ height: 44 }} />
      <Statement
        text={copy.forms.note}
        source={copy.forms.source}
        delay={400}
        maxWidth={1400}
        size={31}
        color={colors.ink}
      />
    </Stage>
  );
};
