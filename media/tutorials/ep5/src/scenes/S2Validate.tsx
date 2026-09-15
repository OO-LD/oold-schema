import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconValidate } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { Card, monoBase, PyBlock, ShellBlock } from '../components/CodeCard';
import { Lead, NoteCard, SceneKicker } from '../components/Parts';
import { copy, uvxShell, validateLibPy, validateShell } from '../copy';
import { sceneById } from '../timeline';

// The first technical scene, because nothing after it is worth doing to a
// document that is quietly wrong. It opens on the failure rather than on the
// command: the two modes are the one thing episodes 1 to 4 set up and neither
// standard catches on its own.
const scene = sceneById('S2');
const A = 250;
const B = 230;
const C = 240;
const D = scene.duration - A - B - C;

// Both modes are about a term losing its meaning on expansion, which is the
// JSON-LD side of the document, so the heading takes the graph purple. Blue is
// the series colour for JSON Schema and structure, and neither of these is a
// JSON Schema error.
const BeatModes: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);
  const close = progress(frame, 34, 34);

  return (
    <>
      <IconValidate
        size={96}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 24 }} />
      <Lead delay={12} maxWidth={1400}>
        {copy.validate.modesLead}
      </Lead>
      <div style={{ height: 34 }} />
      <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
        <NoteCard
          name={copy.validate.modes[0].name}
          text={copy.validate.modes[0].text}
          delay={30}
          slide={(1 - close) * -60}
        />
        <NoteCard
          name={copy.validate.modes[1].name}
          text={copy.validate.modes[1].text}
          delay={48}
          slide={(1 - close) * 60}
        />
      </div>
      <div style={{ height: 38 }} />
      <Caption delay={104} size={31} maxWidth={1300}>
        {copy.validate.modesSub}
      </Caption>
    </>
  );
};

const BeatCli: React.FC = () => {
  const frame = useFrame();

  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.validate.cliLead}
      </Lead>
      <div style={{ height: 32 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <ShellBlock code={validateShell} reveal={progress(frame, 12, 46)} />
      </div>
      <div style={{ height: 32 }} />
      <Caption delay={74} size={30} maxWidth={1440}>
        {copy.validate.cliSub}
      </Caption>
    </>
  );
};

const BeatLibrary: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1400}>
        {copy.validate.libLead}
      </Lead>
      <div style={{ height: 30 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={validateLibPy} fontSize={25} reveal={progress(frame, 12, 60)} />
      </div>
      <div style={{ height: 30 }} />
      <Caption delay={90} size={29} maxWidth={1320}>
        {copy.validate.libSub}
      </Caption>
    </>
  );
};

// The four fields of one failure, one per line and flush left. The terminal
// prints the first three and the message on a single line and only breaks
// before the URL, which is around 120 columns and would have to drop to about
// 20px mono to clear the safe area. So this is a formatted extract rather than
// a transcript: no prompt, no indent, nothing that offers itself as a copy of
// what the terminal drew. Every token in it is verbatim.
const Finding: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useFrame();
  const f = copy.validate.finding;
  const mono = { ...monoBase, fontSize: 25, whiteSpace: 'pre' as const };

  return (
    <Card style={{ opacity: fadeIn(frame, delay, 18) }}>
      <div style={mono}>
        <div>
          <span style={{ color: brand.doc, fontWeight: 600 }}>{f.verdict}</span>
          <span style={{ color: colors.muted }}>{'  '}</span>
          <span style={{ color: colors.oold_ink, fontWeight: 600 }}>{f.rule}</span>
          <span style={{ color: colors.muted }}>{'  '}</span>
          <span style={{ color: brand.validate, fontWeight: 600 }}>{f.check}</span>
        </div>
        <div style={{ color: colors.ink, marginTop: 6 }}>{f.message}</div>
        <div style={{ color: colors.muted }}>{f.link}</div>
      </div>
    </Card>
  );
};

const BeatCi: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1400}>
        {copy.validate.findingLead}
      </Lead>
      <div style={{ height: 26 }} />
      <Finding delay={12} />
      <div style={{ height: 20 }} />
      <Caption delay={48} size={27} maxWidth={1300}>
        {copy.validate.findingNote}
      </Caption>
      <div style={{ height: 30 }} />
      <Caption delay={72} size={31} color={colors.ink} maxWidth={1340}>
        {copy.validate.ci}
      </Caption>
      <div style={{ height: 32 }} />
      <Caption delay={98} size={26} maxWidth={1200}>
        {copy.validate.uvxLabel}
      </Caption>
      <div style={{ height: 16 }} />
      <div style={{ opacity: fadeIn(frame, 106, 16) }}>
        <ShellBlock code={uvxShell} fontSize={24} reveal={progress(frame, 108, 14)} />
      </div>
    </>
  );
};

export const S2Validate: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.validate.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatModes />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatCli />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C} layout="none">
        <BeatLibrary />
      </Sequence>
      <Sequence from={A + B + C} durationInFrames={D + OVERLAP} layout="none">
        <BeatCi />
      </Sequence>
    </Stage>
  );
};
