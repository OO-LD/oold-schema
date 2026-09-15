import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  copy,
  minimalContextLines,
  minimalSchema,
  minimalStructureLines,
} from '../copy';
import { sceneById } from '../timeline';
import { Chip, FileLabel, FileView, Spacer, TopKicker, groupPicker } from './parts';

const scene = sceneById('S2');
const A = 220;
const B = scene.duration - A;

const groupOf = groupPicker(minimalContextLines, minimalStructureLines);

const Anchors: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div style={{ fontSize: 27, color: colors.muted, opacity: fadeIn(frame, 0, 16) }}>
        {copy.file.anchorsLead}
      </div>
      <Spacer h={16} />
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {copy.file.anchors.map((a, i) => (
          <Chip
            key={a}
            delay={14 + i * 12}
            color={i === 2 ? colors.context : colors.schema}
          >
            {a}
          </Chip>
        ))}
      </div>
    </>
  );
};

export const S2File: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <TopKicker>{copy.file.kicker}</TopKicker>

      <FileLabel>{copy.file.label}</FileLabel>
      <FileView code={minimalSchema} groupOf={groupOf} reveal={progress(frame, 8, 108)} />

      <Spacer h={30} />
      <div style={{ height: 106, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Sequence from={0} durationInFrames={A} layout="none">
          <Caption delay={128} size={32} color={colors.ink} maxWidth={1200}>
            {copy.file.caption}
          </Caption>
        </Sequence>
        <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
          <Anchors />
        </Sequence>
      </div>
    </Stage>
  );
};
