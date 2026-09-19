import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { colors, OVERLAP } from '../../../shared/theme';
import { fadeOut, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  copy,
  orgContext,
  orgProperties,
  ownerContext,
  ownerProperties,
  petContextLines,
  petSchema,
  petSchemaLines,
} from '../copy';
import { sceneById } from '../timeline';
import { FileLabel, Note, PanelPair, RefGraph, SceneKicker } from '../components/Parts';

const scene = sceneById('S2');
const A = 260;
const B = 300;
const C = 280;
const D = scene.duration - A - B - C;

const petGroupOf = (lineNo: number): Group =>
  petContextLines.includes(lineNo) ? 'context' : petSchemaLines.includes(lineNo) ? 'schema' : 'plain';

const BeatPet: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileLabel name={copy.hasA.petFile} delay={2} />
      <div style={{ height: 26 }} />
      <CodeBlock
        code={petSchema}
        groupOf={petGroupOf}
        reveal={progress(frame, 10, 90)}
        wash={{ context: progress(frame, 120, 24) }}
        fontSize={24}
      />
      <div style={{ height: 34 }} />
      <Note delay={150} maxWidth={1200}>
        {copy.hasA.petNote}
      </Note>
    </>
  );
};

// The $ref beat and the scoped-context beat share one mount: the panels stay on
// screen for the whole window and only the wash and the note change at TURN.
const TURN = B + 20;

const OwnerBeat: React.FC = () => {
  const frame = useFrame();
  const schemaIn = progress(frame, 40, 26);
  const contextIn = progress(frame, TURN, 26);
  return (
    <>
      <RefGraph file={copy.hasA.ownerFile} hasA={copy.hasA.ownerHasA} delay={2} />
      <div style={{ height: 26 }} />
      <PanelPair
        left={{
          label: copy.hasA.contextLabel,
          code: ownerContext,
          group: 'context',
          delay: 6,
          wash: contextIn,
        }}
        right={{
          label: copy.hasA.schemaLabel,
          code: ownerProperties,
          group: 'schema',
          delay: 18,
          wash: schemaIn * (1 - contextIn),
        }}
      />
      <div style={{ height: 34 }} />
      <div style={{ display: 'grid', width: 1420 }}>
        <div style={{ gridArea: '1 / 1' }}>
          <Note delay={70} maxWidth={1420} opacity={fadeOut(frame, TURN - 10, 12)}>
            {copy.hasA.ownerRefNote}
          </Note>
        </div>
        <div style={{ gridArea: '1 / 1' }}>
          <Note delay={TURN + 4} maxWidth={1420}>
            {copy.hasA.ownerCtxNote}
          </Note>
        </div>
      </div>
    </>
  );
};

const BeatOrg: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <RefGraph
        file={copy.hasA.orgFile}
        isA={copy.hasA.orgIsA}
        hasA={copy.hasA.orgHasA}
        delay={2}
      />
      <div style={{ height: 26 }} />
      <PanelPair
        left={{
          label: copy.hasA.contextLabel,
          code: orgContext,
          group: 'context',
          delay: 6,
          wash: progress(frame, 44, 26),
        }}
        right={{
          label: copy.hasA.schemaLabel,
          code: orgProperties,
          group: 'schema',
          delay: 18,
          wash: progress(frame, 44, 26),
        }}
      />
      <div style={{ height: 30 }} />
      <Note delay={74} maxWidth={1420} color={colors.ink}>
        {copy.hasA.orgNote}
      </Note>
      <div style={{ height: 12 }} />
      <Note delay={104} size={28} maxWidth={1420}>
        {copy.hasA.orgNote2}
      </Note>
    </>
  );
};

export const S2HasA: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.hasA.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatPet />
      </Sequence>
      <Sequence from={A} durationInFrames={B + C} layout="none">
        <OwnerBeat />
      </Sequence>
      <Sequence from={A + B + C} durationInFrames={D + OVERLAP} layout="none">
        <BeatOrg />
      </Sequence>
    </Stage>
  );
};
