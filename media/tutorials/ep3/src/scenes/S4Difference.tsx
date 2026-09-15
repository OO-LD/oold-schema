import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { brand, colors } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, diffHasA, diffIsA } from '../copy';
import { sceneById } from '../timeline';
import { Bullet, SceneKicker, Tag } from '../components/Parts';

const scene = sceneById('S4');
const RIGHT_DELAY = 160;

// The two moves are neutral ink. Purple and blue stay reserved for JSON-LD and
// JSON Schema, which both columns talk about: the bullets are inked by which of
// the two sides the statement belongs to, identically in both columns.
// Resolved at render time: applyTheme swaps the palette after this module is
// imported, so a value captured here would stay light in the dark render.
const pointInk = () => [colors.validate, colors.graph, colors.graph, colors.ink];

const Column: React.FC<{
  tag: string;
  title: string;
  points: string[];
  code: string;
  color: string;
  delay: number;
}> = ({ tag, title, points, code, color, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 720,
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 20),
      }}
    >
      <Tag text={tag} color={color} delay={delay} />
      <div style={{ height: 18 }} />
      <div style={{ fontSize: 33, fontWeight: 600, lineHeight: 1.3, minHeight: 86 }}>{title}</div>
      <div style={{ height: 10 }} />
      <div style={{ minHeight: 212 }}>
        <CodeBlock code={code} groupOf={() => 'schema'} reveal={1} fontSize={22} />
      </div>
      <div style={{ height: 26 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {points.map((p, i) => (
          <Bullet
            key={p}
            text={p}
            color={pointInk()[i] ?? colors.ink}
            delay={delay + 24 + i * 12}
          />
        ))}
      </div>
    </div>
  );
};

export const S4Difference: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.diff.kicker}</SceneKicker>

      <div
        style={{
          display: 'flex',
          gap: 60,
          alignItems: 'flex-start',
          marginTop: 40,
          transform: `translateX(${(1 - progress(frame, RIGHT_DELAY - 34, 34)) * 421}px)`,
        }}
      >
        <Column
          tag={copy.diff.columns[0].tag}
          title={copy.diff.columns[0].title}
          points={copy.diff.columns[0].points}
          code={diffHasA}
          color={colors.ink}
          delay={6}
        />
        <div
          style={{
            width: 2,
            alignSelf: 'stretch',
            background: colors.hairline,
            opacity: fadeIn(frame, RIGHT_DELAY - 20, 20),
          }}
        />
        <Column
          tag={copy.diff.columns[1].tag}
          title={copy.diff.columns[1].title}
          points={copy.diff.columns[1].points}
          code={diffIsA}
          color={colors.ink}
          delay={RIGHT_DELAY}
        />
      </div>
    </Stage>
  );
};
