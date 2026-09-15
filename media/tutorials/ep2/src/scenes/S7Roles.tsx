import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline } from '../../../shared/components/Type';
import { IconGraph, IconOOLD, IconValidate } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP, type } from '../../../shared/theme';
import { pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, minimalContextLines, minimalSchema, minimalStructureLines } from '../copy';
import { sceneById } from '../timeline';
import { FileView, Panel, Spacer, Statement, TopKicker, groupPicker } from './parts';

const scene = sceneById('S7');
const A = 190;
const B = 190;
const C = scene.duration - A - B;

const groupOf = groupPicker(minimalContextLines, [
  ...minimalStructureLines,
  2,
  3,
]);

const BeatFile: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileView
        code={minimalSchema}
        groupOf={groupOf}
        fontSize={25}
        wash={{ context: progress(frame, 8, 24), schema: progress(frame, 30, 24) }}
      />
      <Spacer h={30} />
      <Caption delay={50} size={29} color={colors.muted} maxWidth={1280}>
        {copy.roles.callback}
      </Caption>
      <Spacer h={18} />
      {/* 1280 keeps the line break out of the middle of JSON-LD. */}
      <Statement
        text={copy.roles.claim}
        source={copy.roles.source}
        delay={70}
        size={32}
        maxWidth={1280}
      />
    </>
  );
};

const BeatPanels: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 44, 15);
  return (
    // stretch, so both panel headers sit on one baseline even though the left
    // token list runs onto a second row.
    <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 40 }}>
      <Panel
        color={brand.validate}
        wash={colors.schema_wash}
        Icon={IconValidate}
        label={copy.roles.schema.label}
        sub={copy.roles.schema.sub}
        tokens={copy.roles.schema.tokens}
        delay={8}
      />
      <div
        style={{ width: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <IconOOLD
          size={140}
          style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
        />
      </div>
      <Panel
        color={brand.graph}
        wash={colors.context_wash}
        Icon={IconGraph}
        label={copy.roles.context.label}
        sub={copy.roles.context.sub}
        tokens={copy.roles.context.tokens}
        delay={24}
      />
    </div>
  );
};

const BeatPunch: React.FC = () => (
  <>
    <Headline groups={[copy.roles.punch]} delay={4} size={type.headlineSm.size} maxWidth={1400} />
    <Spacer h={40} />
    <Caption delay={38} size={33} color={colors.muted} maxWidth={1280}>
      {copy.roles.sub}
    </Caption>
  </>
);

export const S7Roles: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <TopKicker>{copy.roles.kicker}</TopKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFile />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatPanels />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatPunch />
      </Sequence>
    </Stage>
  );
};
