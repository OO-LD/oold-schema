import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconCode } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { PyBlock } from '../components/CodeCard';
import { Lead, SceneKicker, Table, Tag } from '../components/Parts';
import { copy, fieldsPy, linkPy, modelContextLines, modelPy } from '../copy';
import { sceneById } from '../timeline';

// The declaration half of the graph-object binding: what a link looks like in
// a class body. The half after it, S4, is what happens when you read one.
const scene = sceneById('S3');
const A = 250;
const B = 240;
const C = 270;
const D = scene.duration - A - B - C;

const BeatContext: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      <IconCode
        size={84}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 18 }} />
      <Lead delay={12} maxWidth={1300}>
        {copy.model.contextLead}
      </Lead>
      <div style={{ height: 22 }} />
      <div style={{ opacity: fadeIn(frame, 22, 16) }}>
        <PyBlock
          code={modelPy}
          fontSize={22}
          reveal={progress(frame, 24, 84)}
          contextLines={modelContextLines}
        />
      </div>
      <div style={{ height: 20 }} />
      <Caption delay={116} size={27} maxWidth={1480}>
        {copy.model.contextSub}
      </Caption>
    </>
  );
};

const BeatFields: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.model.fieldsLead}
      </Lead>
      <div style={{ height: 30 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={fieldsPy} fontSize={25} reveal={progress(frame, 12, 56)} />
      </div>
      <div style={{ height: 30 }} />
      <Caption delay={82} size={28} maxWidth={1500}>
        {copy.model.fieldsSub}
      </Caption>
    </>
  );
};

const BeatLink: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Lead delay={0} maxWidth={980}>
          {copy.model.linkLead}
        </Lead>
        <Tag color={brand.code} delay={18}>
          {copy.model.newBadge}
        </Tag>
      </div>
      <div style={{ height: 26 }} />
      <div style={{ opacity: fadeIn(frame, 12, 16) }}>
        <PyBlock code={linkPy} fontSize={24} reveal={progress(frame, 14, 72)} />
      </div>
      <div style={{ height: 26 }} />
      <Caption delay={96} size={28} maxWidth={1500}>
        {copy.model.linkSub}
      </Caption>
    </>
  );
};

const COLS = [400, 400, 520];

// Column three is the new spelling, so it is the one carrying colour: green is
// the series hue for code. "not yet" is the one cell in it that is not an
// advantage, and it drops back to the muted ink so the column does not
// overclaim.
const cellColor = (row: string[], col: number): string => {
  if (col !== 2) return col === 0 ? colors.ink : colors.muted;
  return row[2] === 'not yet' ? colors.muted : brand.code;
};

const BeatCompare: React.FC = () => {
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.model.compareLead}
      </Lead>
      <div style={{ height: 30 }} />
      <Table
        head={copy.model.compareHead}
        rows={copy.model.compare}
        cols={COLS}
        firstMono={false}
        colorOf={cellColor}
        fontSize={24}
      />
      <div style={{ height: 30 }} />
      <Caption delay={72} size={28} color={colors.ink} maxWidth={1420}>
        {copy.model.compareSub}
      </Caption>
    </>
  );
};

export const S3Declare: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.model.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatContext />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatFields />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C} layout="none">
        <BeatLink />
      </Sequence>
      <Sequence from={A + B + C} durationInFrames={D + OVERLAP} layout="none">
        <BeatCompare />
      </Sequence>
    </Stage>
  );
};
