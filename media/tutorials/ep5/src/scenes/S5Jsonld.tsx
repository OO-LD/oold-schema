import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconGraph } from '../../../shared/components/Icons';
import { OVERLAP } from '../../../shared/theme';
import { fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { PyBlock } from '../components/CodeCard';
import { Lead, SceneKicker } from '../components/Parts';
import { copy, jsonldCallPy, jsonldOutput, sparqlPy, sparqlQuoteLines } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S5');
const A = 200;
const B = 300;
const C = scene.duration - A - B;

// Expanded JSON-LD is all meaning and no shape, so every line takes the
// JSON-LD purple the series gives to context.
const outputGroup = (): Group => 'context';

const BeatCall: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      <IconGraph
        size={104}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 28 }} />
      <Lead delay={16} maxWidth={1300}>
        {copy.jsonld.callLead}
      </Lead>
      <div style={{ height: 28 }} />
      <div style={{ opacity: fadeIn(frame, 26, 16) }}>
        <PyBlock code={jsonldCallPy} reveal={progress(frame, 28, 42)} />
      </div>
      <div style={{ height: 28 }} />
      <Caption delay={80} size={29} maxWidth={1440}>
        {copy.jsonld.callSub}
      </Caption>
    </>
  );
};

const BeatReturn: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1400}>
        {copy.jsonld.outputLead}
      </Lead>
      <div style={{ height: 24 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <CodeBlock
          code={jsonldOutput}
          groupOf={outputGroup}
          fontSize={22}
          reveal={progress(frame, 12, 76)}
          wash={{ context: progress(frame, 100, 24) }}
        />
      </div>
      <div style={{ height: 22 }} />
      <Caption delay={128} size={27} maxWidth={1560}>
        {copy.jsonld.outputSub}
      </Caption>
    </>
  );
};

const BeatSparql: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.jsonld.sparqlLead}
      </Lead>
      <div style={{ height: 24 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock
          code={sparqlPy}
          fontSize={24}
          reveal={progress(frame, 12, 84)}
          quoteLines={sparqlQuoteLines}
        />
      </div>
      <div style={{ height: 24 }} />
      <Caption delay={110} size={29} maxWidth={1300}>
        {copy.jsonld.sparqlSub}
      </Caption>
    </>
  );
};

export const S5Jsonld: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.jsonld.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatCall />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatReturn />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatSparql />
      </Sequence>
    </Stage>
  );
};
