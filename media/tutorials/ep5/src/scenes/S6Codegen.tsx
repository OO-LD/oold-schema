import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { IconOOLD } from '../../../shared/components/Icons';
import { colors, fonts, OVERLAP } from '../../../shared/theme';
import { enterUp, fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { PyBlock } from '../components/CodeCard';
import { Lead, SceneKicker } from '../components/Parts';
import { copy, generatePy, personSchema, schemaContextLines, usePy } from '../copy';
import { sceneById } from '../timeline';

// Labelled experimental for the whole scene, because every beat in it is the
// generator. The label sits in the kicker rather than on one beat, so it is on
// screen the entire time the subject is.
const scene = sceneById('S6');
const A = 250;
const B = 210;
const C = scene.duration - A - B;

// Shape blue, meaning purple: the same split episode 2 used to read a document.
const schemaGroup = (lineNo: number): Group =>
  schemaContextLines.includes(lineNo) ? 'context' : 'schema';

const BeatSchema: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      <IconOOLD
        size={80}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 16 }} />
      <Lead delay={12} maxWidth={1300}>
        {copy.codegen.schemaLead}
      </Lead>
      <div style={{ height: 20 }} />
      <div style={{ opacity: fadeIn(frame, 22, 16) }}>
        <CodeBlock
          code={personSchema}
          groupOf={schemaGroup}
          fontSize={22}
          reveal={progress(frame, 24, 62)}
          wash={{
            schema: progress(frame, 96, 22),
            context: progress(frame, 114, 22),
          }}
        />
      </div>
      <div style={{ height: 18 }} />
      <Caption delay={142} size={26} maxWidth={1560}>
        {copy.codegen.schemaSub}
      </Caption>
    </>
  );
};

const BeatGenerate: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.codegen.generateLead}
      </Lead>
      <div style={{ height: 28 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={generatePy} fontSize={24} reveal={progress(frame, 12, 78)} />
      </div>
      <div style={{ height: 26 }} />
      <Caption delay={110} size={28} maxWidth={1400}>
        {copy.codegen.generateSub}
      </Caption>
    </>
  );
};

const BeatUse: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.codegen.useLead}
      </Lead>
      <div style={{ height: 26 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={usePy} fontSize={25} reveal={progress(frame, 12, 44)} />
      </div>
      <div style={{ height: 24 }} />
      <Caption delay={66} size={28} maxWidth={1240}>
        {copy.codegen.useSub}
      </Caption>
      <div style={{ height: 34 }} />
      <div style={{ textAlign: 'left', maxWidth: 1300 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: colors.muted,
            marginBottom: 14,
            ...enterUp(frame, 86, 18, 16),
          }}
        >
          {copy.codegen.caveatLead}
        </div>
        {copy.codegen.caveats.map((line, i) => (
          <div
            key={line}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              marginBottom: 8,
              ...enterUp(frame, 96 + i * 12, 18, 16),
            }}
          >
            <div style={{ fontFamily: fonts.mono, fontSize: 26, color: colors.muted }}>-</div>
            <div style={{ fontSize: 27, lineHeight: 1.4, color: colors.ink }}>{line}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export const S6Codegen: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker tag={copy.codegen.experimental}>{copy.codegen.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatSchema />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatGenerate />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatUse />
      </Sequence>
    </Stage>
  );
};
