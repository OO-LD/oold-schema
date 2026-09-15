import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { brand, colors, type } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { closingBad, closingGood, copy } from '../copy';
import { sceneById } from '../timeline';
import { Note, SceneKicker, Tag } from '../components/Parts';

const scene = sceneById('S6');
const RIGHT_DELAY = 160;

const Column: React.FC<{
  tag: string;
  tagColor: string;
  source?: string;
  code: string;
  group: Group;
  notes: string[];
  delay: number;
}> = ({ tag, tagColor, source, code, group, notes, delay }) => {
  const frame = useFrame();
  return (
    <div style={{ width: 700, textAlign: 'left', opacity: fadeIn(frame, delay, 20) }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', minHeight: 52 }}>
        <Tag text={tag} color={tagColor} delay={delay} />
      </div>
      <div style={{ height: 20 }} />
      <CodeBlock code={code} groupOf={() => group} reveal={1} fontSize={22} />
      <div style={{ height: 14 }} />
      <div
        style={{
          fontSize: type.label.size,
          lineHeight: 1.4,
          color: colors.muted,
          minHeight: 34,
          opacity: source ? fadeIn(frame, delay + 16, 18) : 0,
        }}
      >
        {source ?? ''}
      </div>
      <div style={{ height: 14 }} />
      {notes.map((n, i) => (
        <div key={n} style={{ marginTop: i === 0 ? 0 : 12 }}>
          <Note delay={delay + 26 + i * 20} size={26} maxWidth={700}>
            {n}
          </Note>
        </div>
      ))}
    </div>
  );
};

export const S6Closing: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.closing.kicker}</SceneKicker>

      <div
        style={{
          display: 'flex',
          gap: 60,
          alignItems: 'flex-start',
          marginTop: 30,
          transform: `translateX(${(1 - progress(frame, RIGHT_DELAY - 34, 34)) * 411}px)`,
        }}
      >
        <Column
          tag={copy.closing.badTag}
          tagColor={colors.muted}
          code={closingBad}
          group="plain"
          notes={[copy.closing.badNote]}
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
          tag={copy.closing.goodTag}
          tagColor={brand.validate}
          source={copy.closing.goodSource}
          code={closingGood}
          group="schema"
          notes={[copy.closing.goodNote, copy.closing.goodNote2]}
          delay={RIGHT_DELAY}
        />
      </div>
    </Stage>
  );
};
