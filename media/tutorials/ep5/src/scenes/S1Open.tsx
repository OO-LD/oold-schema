import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline, Kicker } from '../../../shared/components/Type';
import { IconCode, IconOOLD } from '../../../shared/components/Icons';
import { colors, OVERLAP, type } from '../../../shared/theme';
import { fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { ShellBlock } from '../components/CodeCard';
import { Lead } from '../components/Parts';
import { copy, installShell, verifyShell } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S1');
const A = 140;
const B = 130;
const C = scene.duration - A - B;

const BeatRecall: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4, 15);

  return (
    <>
      <IconOOLD
        size={104}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 22 }} />
      <Kicker color={colors.oold_ink} delay={12}>
        {copy.open.kicker}
      </Kicker>
      <Headline groups={copy.open.recall} delay={22} size={type.headline.size} maxWidth={1500} />
      <div style={{ height: 30 }} />
      <Caption delay={70} size={33} maxWidth={1220}>
        {copy.open.recallSub}
      </Caption>
    </>
  );
};

const BeatQuestion: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 6, 15);

  return (
    <>
      <IconCode
        size={104}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 34 }} />
      <Headline groups={copy.open.question} delay={20} size={type.headline.size} maxWidth={1500} />
      <div style={{ height: 30 }} />
      <Caption delay={66} size={31} maxWidth={1200}>
        {copy.open.questionSub}
      </Caption>
    </>
  );
};

const BeatInstall: React.FC = () => {
  const frame = useFrame();

  return (
    <>
      <Lead delay={0} maxWidth={1200}>
        {copy.open.installLead}
      </Lead>
      <div style={{ height: 28 }} />
      <div style={{ opacity: fadeIn(frame, 12, 16) }}>
        <ShellBlock code={installShell} reveal={progress(frame, 14, 34)} />
      </div>
      <div style={{ height: 26 }} />
      <div style={{ opacity: fadeIn(frame, 58, 16) }}>
        <ShellBlock code={verifyShell} fontSize={24} reveal={progress(frame, 60, 14)} />
      </div>
      <div style={{ height: 26 }} />
      <Caption delay={84} size={30} maxWidth={1180}>
        {copy.open.installSub}
      </Caption>
    </>
  );
};

export const S1Open: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatRecall />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatQuestion />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatInstall />
      </Sequence>
    </Stage>
  );
};
