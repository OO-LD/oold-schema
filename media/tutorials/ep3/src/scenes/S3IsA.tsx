import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { brand, colors, fonts, OVERLAP } from '../../../shared/theme';
import { enterUp, fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  copy,
  personContext,
  personProperties,
  thingContext,
  thingProperties,
} from '../copy';
import { sceneById } from '../timeline';
import { FileLabel, Note, PanelPair, SceneKicker } from '../components/Parts';

const scene = sceneById('S3');
const A = 300;
const B = 360;
const C = scene.duration - A - B;

const BeatThing: React.FC = () => (
  <>
    <FileLabel name={copy.isA.thingFile} delay={2} />
    <div style={{ height: 26 }} />
    <PanelPair
      left={{ label: copy.hasA.contextLabel, code: thingContext, group: 'context', delay: 6 }}
      right={{ label: copy.hasA.schemaLabel, code: thingProperties, group: 'schema', delay: 18 }}
    />
    <div style={{ height: 36 }} />
    <Note delay={64} maxWidth={1300}>
      {copy.isA.thingNote}
    </Note>
  </>
);

const BeatPerson: React.FC = () => {
  const frame = useFrame();
  const w = progress(frame, 46, 26);
  return (
    <>
      <FileLabel name={copy.isA.personFile} delay={2} />
      <div style={{ height: 26 }} />
      <PanelPair
        left={{ label: copy.hasA.contextLabel, code: personContext, group: 'context', delay: 6, wash: w }}
        right={{ label: copy.hasA.schemaLabel, code: personProperties, group: 'schema', delay: 18, wash: w }}
      />
      <div style={{ height: 30 }} />
      <Note delay={78} maxWidth={1440} color={colors.ink}>
        {copy.isA.personNote}
      </Note>
      <div style={{ height: 12 }} />
      <Note delay={150} size={27} maxWidth={1440}>
        {copy.isA.scalarNote}
      </Note>
    </>
  );
};

const ChainCard: React.FC<{
  file: string;
  lines: string[];
  color: string;
  delay: number;
}> = ({ file, lines, color, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 430,
        background: colors.panel,
        border: `3px solid ${color}33`,
        borderRadius: 18,
        padding: '28px 30px',
        textAlign: 'left',
        ...enterUp(frame, delay, 20, 20),
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: 25, fontWeight: 600, color }}>{file}</div>
      <div style={{ height: 14, borderBottom: `2px solid ${colors.hairline}`, marginBottom: 14 }} />
      {lines.map((l, i) => (
        <div
          key={l}
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            lineHeight: 1.6,
            color: colors.muted,
            opacity: fadeIn(frame, delay + 14 + i * 7, 14),
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
};

const ExtendsArrow: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 20);
  return (
    <div style={{ width: 110, paddingTop: 46 }}>
      <div
        style={{
          fontSize: 20,
          color: colors.muted,
          marginBottom: 6,
          opacity: fadeIn(frame, delay + 8, 14),
        }}
      >
        {copy.isA.extends}
      </div>
      <svg width={110} height={20} viewBox="0 0 110 20">
        <path
          d="M 104 10 L 18 10"
          stroke={colors.muted}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d="M 26 4 L 14 10 L 26 16"
          stroke={colors.muted}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={fadeIn(frame, delay + 16, 12)}
        />
      </svg>
    </div>
  );
};

const BeatChain: React.FC = () => (
  <>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <ChainCard file={copy.isA.chain[0].file} lines={copy.isA.chain[0].lines} color={brand.validate} delay={4} />
      <ExtendsArrow delay={26} />
      <ChainCard file={copy.isA.chain[1].file} lines={copy.isA.chain[1].lines} color={brand.validate} delay={38} />
      <ExtendsArrow delay={60} />
      <ChainCard file={copy.isA.chain[2].file} lines={copy.isA.chain[2].lines} color={brand.validate} delay={72} />
    </div>
    <div style={{ height: 52 }} />
    <Note delay={112} size={32} color={colors.ink} maxWidth={1300}>
      {copy.isA.chainNote}
    </Note>
  </>
);

export const S3IsA: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.isA.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatThing />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatPerson />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatChain />
      </Sequence>
    </Stage>
  );
};
