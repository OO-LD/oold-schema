import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconGraph } from '../../../shared/components/Icons';
import { colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { PyBlock } from '../components/CodeCard';
import { Lead, SceneKicker } from '../components/Parts';
import {
  bindBatchPy,
  bindFillPy,
  bindLazyPy,
  bindRealPy,
  bindWalkPy,
  copy,
} from '../copy';
import { sceneById } from '../timeline';

// The longest scene in the episode, and the one it exists for. Three claims,
// one beat each, in the order they build on: the field takes either form, a
// read gives the real object, and the fetching behind that read is lazy and
// batched. The walk at the end is what all three add up to.
const scene = sceneById('S4');
const A = 260;
const B = 230;
const C = 240;
const D = 250;
const E = scene.duration - A - B - C - D;

const BeatFill: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      <IconGraph
        size={92}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 20 }} />
      <Lead delay={12} maxWidth={1300}>
        {copy.bind.fillLead}
      </Lead>
      <div style={{ height: 24 }} />
      <div style={{ opacity: fadeIn(frame, 22, 16) }}>
        <PyBlock code={bindFillPy} fontSize={24} reveal={progress(frame, 24, 66)} />
      </div>
      <div style={{ height: 24 }} />
      <Caption delay={100} size={28} maxWidth={1480}>
        {copy.bind.fillSub}
      </Caption>
    </>
  );
};

const BeatReal: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.bind.realLead}
      </Lead>
      <div style={{ height: 40 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={bindRealPy} fontSize={29} reveal={progress(frame, 12, 40)} />
      </div>
      <div style={{ height: 40 }} />
      <Caption delay={66} size={30} color={colors.ink} maxWidth={1380}>
        {copy.bind.realSub}
      </Caption>
    </>
  );
};

const BeatLazy: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.bind.lazyLead}
      </Lead>
      <div style={{ height: 40 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={bindLazyPy} fontSize={27} reveal={progress(frame, 12, 42)} />
      </div>
      <div style={{ height: 40 }} />
      <Caption delay={70} size={29} maxWidth={1380}>
        {copy.bind.lazySub}
      </Caption>
    </>
  );
};

const BeatBatch: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.bind.batchLead}
      </Lead>
      <div style={{ height: 40 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={bindBatchPy} fontSize={27} reveal={progress(frame, 12, 42)} />
      </div>
      <div style={{ height: 40 }} />
      <Caption delay={70} size={29} maxWidth={1460}>
        {copy.bind.batchSub}
      </Caption>
    </>
  );
};

const BeatWalk: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.bind.walkLead}
      </Lead>
      <div style={{ height: 28 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={bindWalkPy} fontSize={25} reveal={progress(frame, 12, 60)} />
      </div>
      <div style={{ height: 28 }} />
      <Caption delay={88} size={28} maxWidth={1500}>
        {copy.bind.walkSub}
      </Caption>
    </>
  );
};

export const S4Bind: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.bind.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFill />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatReal />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C} layout="none">
        <BeatLazy />
      </Sequence>
      <Sequence from={A + B + C} durationInFrames={D} layout="none">
        <BeatBatch />
      </Sequence>
      <Sequence from={A + B + C + D} durationInFrames={E + OVERLAP} layout="none">
        <BeatWalk />
      </Sequence>
    </Stage>
  );
};
