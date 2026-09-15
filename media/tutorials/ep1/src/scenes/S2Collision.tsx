import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Kicker } from '../../../shared/components/Type';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { colors, type } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { NotEqual, Punch, SceneTitle } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S2');

const COL = 600;
const LABEL_BLOCK = 54;
// Three code lines plus the card's own 34px padding, so the NotEqual mark can be
// put on the vertical centre of the two cards.
const CODE_BLOCK = Math.round(3 * type.code.size * type.code.leading) + 68;

const Side: React.FC<{
  domain: string;
  code: string;
  means: string;
  delay: number;
}> = ({ domain, code, means, delay }) => {
  const frame = useFrame();
  return (
    <div style={{ width: COL, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          height: LABEL_BLOCK,
          fontSize: type.body.size,
          fontWeight: 700,
          color: colors.ink,
          ...enterUp(frame, delay, 18, 16),
        }}
      >
        {domain}
      </div>
      <div style={{ opacity: fadeIn(frame, delay + 8, 18) }}>
        <CodeBlock code={code} groupOf={() => 'plain'} />
      </div>
      <div
        style={{
          marginTop: 26,
          width: 580,
          fontSize: type.body.size,
          lineHeight: type.body.leading,
          color: colors.muted,
          ...enterUp(frame, delay + 222, 20, 18),
        }}
      >
        {means}
      </div>
    </div>
  );
};

export const S2Collision: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.collision.kicker}</Kicker>
      </div>

      <SceneTitle delay={0}>{copy.collision.title}</SceneTitle>
      <div style={{ height: 46 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 60 }}>
        <Side {...copy.collision.left} delay={8} />
        <div
          style={{
            width: 120,
            display: 'flex',
            justifyContent: 'center',
            marginTop: LABEL_BLOCK + CODE_BLOCK / 2 - 32,
          }}
        >
          <NotEqual delay={360} size={72} />
        </div>
        <Side {...copy.collision.right} delay={22} />
      </div>

      <div style={{ height: 52 }} />
      <Punch delay={470}>{copy.collision.punch}</Punch>
    </Stage>
  );
};
