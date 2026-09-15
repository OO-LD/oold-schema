import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { colors, OVERLAP } from '../../../shared/theme';
import { progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, minimalSchema, minimalStructureLines } from '../copy';
import { sceneById } from '../timeline';
import { Bullet, DefRow, FileView, Spacer, TopKicker, only } from './parts';

const scene = sceneById('S6');
const A = 170;
const B = scene.duration - A;

const groupOf = only(minimalStructureLines, 'schema');

const BeatFile: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileView
        code={minimalSchema}
        groupOf={groupOf}
        wash={{ schema: progress(frame, 10, 22) }}
        focus={minimalStructureLines}
        scrim={progress(frame, 10, 22) * 0.66}
      />
      <Spacer h={36} />
      <Caption delay={40} size={34} color={colors.ink} maxWidth={1300}>
        {copy.structure.lead}
      </Caption>
    </>
  );
};

const BeatRows: React.FC = () => (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      {copy.structure.rows.map((r, i) => (
        <DefRow key={r.code} code={r.code} note={r.note} color={colors.schema} delay={8 + i * 22} />
      ))}
    </div>
    <Spacer h={48} />
    <Bullet delay={104} color={colors.schema} width={1180} size={30}>
      {copy.structure.caption}
    </Bullet>
  </>
);

export const S6Structure: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <TopKicker color={colors.schema}>{copy.structure.kicker}</TopKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFile />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatRows />
      </Sequence>
    </Stage>
  );
};
