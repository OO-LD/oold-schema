import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { Headline, Kicker } from '../../../shared/components/Type';
import { IconGraph, IconOOLD } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP, type } from '../../../shared/theme';
import { fadeIn, pop, sceneOpacity } from '../../../shared/lib/motion';
import {
  copy,
  inlinedContext,
  inlinedContextLines,
  instanceCode,
  instanceContextLines,
} from '../copy';
import { sceneById } from '../timeline';
import { Bullet, FileLabel, Note, PanelLabel, SceneKicker } from '../components/Parts';

const scene = sceneById('S7');
const A = 250;
const B = 230;
const C = scene.duration - A - B;

// The two move bullets are neutral ink; only the third one is about the
// @context, so it is the one that reads purple.
// Resolved at render time: applyTheme swaps the palette after this module is
// imported, so a value captured here would stay light in the dark render.
const recapInk = () => [colors.ink, colors.ink, colors.graph];

const instanceGroupOf = (lineNo: number): Group =>
  instanceContextLines.includes(lineNo) ? 'context' : 'plain';

const inlinedGroupOf = (lineNo: number): Group =>
  inlinedContextLines.includes(lineNo) ? 'context' : 'plain';

const BeatInstance: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileLabel name={copy.finish.instanceFile} delay={2} />
      <div style={{ height: 26 }} />
      <div style={{ display: 'flex', gap: 44, alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 6, 18) }}>
          <PanelLabel text={copy.finish.asWrittenLabel} color={colors.muted} delay={6} />
          <CodeBlock code={instanceCode} groupOf={instanceGroupOf} reveal={1} fontSize={24} />
        </div>
        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 40, 18) }}>
          <PanelLabel text={copy.finish.inlinedLabel} color={brand.graph} delay={40} />
          <CodeBlock code={inlinedContext} groupOf={inlinedGroupOf} reveal={1} fontSize={24} />
        </div>
      </div>
      <div style={{ height: 36 }} />
      <Note delay={82} maxWidth={1420} color={colors.ink}>
        {copy.finish.instanceNote}
      </Note>
    </>
  );
};

const BeatRecap: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);
  return (
    <>
      <IconOOLD
        size={96}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 20 }} />
      <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: -0.6, opacity: fadeIn(frame, 12, 18) }}>
        {copy.finish.recapTitle}
      </div>
      <div style={{ height: 40 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: 1380 }}>
        {copy.finish.recap.map((r, i) => (
          <Bullet key={r} text={r} color={recapInk()[i]} delay={34 + i * 22} />
        ))}
      </div>
    </>
  );
};

const BeatNext: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 4, 15);
  return (
    <>
      <IconGraph
        size={120}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 34 }} />
      <Kicker color={colors.oold_ink} delay={18}>
        {copy.finish.nextKicker}
      </Kicker>
      <Headline
        groups={copy.finish.next}
        delay={32}
        stagger={16}
        size={type.headlineSm.size}
        leading={type.headlineSm.leading}
        maxWidth={1400}
      />
    </>
  );
};

export const S7Together: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <SceneKicker>{copy.finish.kicker}</SceneKicker>
        <BeatInstance />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatRecap />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatNext />
      </Sequence>
    </Stage>
  );
};
