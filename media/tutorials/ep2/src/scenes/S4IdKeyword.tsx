import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, minimalIdLine, minimalSchema } from '../copy';
import { sceneById } from '../timeline';
import { Bullet, Chip, FileView, Spacer, TopKicker, only } from './parts';

const scene = sceneById('S4');
const A = 170;
const B = scene.duration - A;

const focus = [minimalIdLine];
const groupOf = only(focus, 'schema');
const allSchema = () => 'schema' as const;

const BeatFile: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileView
        code={minimalSchema}
        groupOf={groupOf}
        wash={{ schema: progress(frame, 10, 22) }}
        focus={focus}
        scrim={progress(frame, 10, 22) * 0.66}
      />
      <Spacer h={36} />
      <Caption delay={40} size={34} color={colors.ink} maxWidth={1300}>
        {copy.idKeyword.lead}
      </Caption>
    </>
  );
};

const BeatRequired: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileView code={copy.idKeyword.fragment} groupOf={allSchema} fontSize={34} />
      <Spacer h={40} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {copy.idKeyword.points.map((p, i) => (
          <Bullet key={p} delay={16 + i * 30} color={colors.schema}>
            {p}
          </Bullet>
        ))}
      </div>
      <Spacer h={38} />
      <div style={{ opacity: fadeIn(frame, 96, 18) }}>
        <Chip color={colors.schema} size={27}>
          {copy.idKeyword.required}
        </Chip>
      </div>
    </>
  );
};

export const S4IdKeyword: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <TopKicker color={colors.schema}>{copy.idKeyword.kicker}</TopKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFile />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatRequired />
      </Sequence>
    </Stage>
  );
};
