import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Kicker } from '../../../shared/components/Type';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { IconValidate } from '../../../shared/components/Icons';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { Check, Punch, SceneTitle } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S4');

const Case: React.FC<{ domain: string; code: string; delay: number }> = ({
  domain,
  code,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          fontSize: type.label.size,
          fontWeight: type.label.weight,
          color: colors.muted,
          marginBottom: 8,
          ...enterUp(frame, delay, 16, 12),
        }}
      >
        {domain}
      </div>
      <div style={{ opacity: fadeIn(frame, delay + 6, 16) }}>
        <CodeBlock code={code} groupOf={() => 'plain'} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
          ...enterUp(frame, delay + 80, 16, 12),
        }}
      >
        <Check color={brand.validate} delay={delay + 84} size={30} />
        <span style={{ fontFamily: fonts.mono, fontSize: type.code.size, color: brand.validate }}>
          {copy.schema.verdict}
        </span>
      </div>
    </div>
  );
};

export const S4Schema: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.schema.kicker}</Kicker>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconValidate size={62} style={{ opacity: fadeIn(frame, 0, 18) }} />
        <SceneTitle delay={6}>{copy.schema.title}</SceneTitle>
      </div>

      <div style={{ height: 18 }} />
      <div style={{ opacity: fadeIn(frame, 30, 16) }}>
        <CodeBlock
          code={copy.schema.code}
          groupOf={() => 'schema'}
          reveal={progress(frame, 36, 96)}
        />
      </div>

      <div style={{ height: 20 }} />
      <div
        style={{
          fontSize: type.body.size,
          fontWeight: 600,
          color: colors.muted,
          ...enterUp(frame, 190, 18, 14),
        }}
      >
        {copy.schema.passLead}
      </div>

      <div style={{ height: 12 }} />
      <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>
        {copy.schema.cases.map((c, i) => (
          <Case key={c.domain} domain={c.domain} code={c.code} delay={216 + i * 30} />
        ))}
      </div>

      <div style={{ height: 22 }} />
      <Punch delay={440} maxWidth={1400}>
        {copy.schema.punch}
      </Punch>
    </Stage>
  );
};
