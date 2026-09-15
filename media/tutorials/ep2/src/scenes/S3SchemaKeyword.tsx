import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconValidate } from '../../../shared/components/Icons';
import { colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, minimalSchema, minimalSchemaLine, vocabularyExcerpt } from '../copy';
import { sceneById } from '../timeline';
import {
  Bullet,
  Chip,
  FileLabel,
  FileView,
  Spacer,
  TopKicker,
  only,
} from './parts';

const scene = sceneById('S3');
const A = 140;
const B = 190;
const C = scene.duration - A - B;

const focus = [minimalSchemaLine];
const groupOf = only(focus, 'schema');
const allSchema = () => 'schema' as const;

const BeatFile: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <TopKicker color={colors.schema}>{copy.schemaKeyword.kicker}</TopKicker>
      <FileView
        code={minimalSchema}
        groupOf={groupOf}
        wash={{ schema: progress(frame, 10, 22) }}
        focus={focus}
        scrim={progress(frame, 10, 22) * 0.66}
      />
      <Spacer h={36} />
      <Caption delay={40} size={34} color={colors.ink} maxWidth={1300}>
        {copy.schemaKeyword.lead}
      </Caption>
    </>
  );
};

const BeatPoints: React.FC = () => (
  <>
    <TopKicker color={colors.schema}>{copy.schemaKeyword.kicker}</TopKicker>
    <FileView code={copy.schemaKeyword.fragment} groupOf={allSchema} fontSize={30} />
    <Spacer h={44} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {copy.schemaKeyword.points.map((p, i) => (
        <Bullet key={p} delay={18 + i * 26} color={colors.schema}>
          {p}
        </Bullet>
      ))}
    </div>
  </>
);

const BeatVocabulary: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <TopKicker color={colors.schema}>{copy.schemaKeyword.metaKicker}</TopKicker>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
        <IconValidate size={54} />
        <FileLabel>{copy.schemaKeyword.excerptLabel}</FileLabel>
      </div>
      <FileView code={vocabularyExcerpt} groupOf={allSchema} reveal={progress(frame, 4, 40)} />
      <Spacer h={34} />
      <div style={{ opacity: fadeIn(frame, 60, 18) }}>
        <Chip color={colors.oold_ink} size={27}>
          {copy.schemaKeyword.excerptNote}
        </Chip>
      </div>
    </>
  );
};

export const S3SchemaKeyword: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFile />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatPoints />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatVocabulary />
      </Sequence>
    </Stage>
  );
};
