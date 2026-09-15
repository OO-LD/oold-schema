import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { IconGraph } from '../../../shared/components/Icons';
import { brand, colors, fonts, OVERLAP, type } from '../../../shared/theme';
import { enterUp, fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  copy,
  reflectionContextLines,
  reflectionExample,
  reflectionSchemaLines,
} from '../copy';
import { sceneById } from '../timeline';
import { FileLabel, Note, PanelLabel, SceneKicker } from '../components/Parts';

const scene = sceneById('S5');
const A = 270;
const B = 300;
const C = scene.duration - A - B;

const reflectGroupOf = (lineNo: number): Group =>
  reflectionContextLines.includes(lineNo)
    ? 'context'
    : reflectionSchemaLines.includes(lineNo)
      ? 'schema'
      : 'plain';

const BeatRule: React.FC = () => {
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
      <div
        style={{
          fontSize: 44,
          fontWeight: 600,
          lineHeight: 1.34,
          letterSpacing: -0.4,
          maxWidth: 1440,
          ...enterUp(frame, 14, 24, 24),
        }}
      >
        {copy.reflect.rule}
      </div>
      <div style={{ height: 22 }} />
      <div
        style={{
          fontSize: type.label.size,
          color: colors.muted,
          opacity: fadeIn(frame, 44, 18),
        }}
      >
        {copy.reflect.source}
      </div>
      <div style={{ height: 40 }} />
      <Note delay={70} size={31} maxWidth={1300}>
        {copy.reflect.implies}
      </Note>
      <div style={{ height: 18 }} />
      <Note delay={110} size={31} color={brand.graph} maxWidth={1300}>
        {copy.reflect.ruleNote}
      </Note>
    </>
  );
};

const COLS = [430, 660, 290];

const BeatTable: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div style={{ display: 'flex', gap: 40, width: 1460, textAlign: 'left' }}>
        {copy.reflect.tableHead.map((h, i) => (
          <div key={h} style={{ width: COLS[i] }}>
            <PanelLabel
              text={h}
              color={i === 1 ? brand.graph : colors.muted}
              delay={4 + i * 6}
            />
          </div>
        ))}
      </div>
      <div style={{ height: 4, width: 1460, background: colors.hairline, borderRadius: 2 }} />
      {copy.reflect.table.map((row, i) => {
        const delay = 24 + i * 26;
        return (
          <div
            key={row.where}
            style={{
              display: 'flex',
              gap: 40,
              width: 1460,
              textAlign: 'left',
              alignItems: 'flex-start',
              padding: '30px 0',
              borderBottom: `2px solid ${colors.hairline}`,
              ...enterUp(frame, delay, 20, 16),
            }}
          >
            <div style={{ width: COLS[0], fontSize: 29, lineHeight: 1.35, fontWeight: 600 }}>
              {row.where}
            </div>
            <div style={{ width: COLS[1], fontSize: 29, lineHeight: 1.35, color: brand.graph }}>
              {row.into}
            </div>
            <div
              style={{
                width: COLS[2],
                fontFamily: fonts.mono,
                fontSize: 22,
                lineHeight: 1.5,
                color: colors.muted,
                paddingTop: 4,
              }}
            >
              {row.example}
            </div>
          </div>
        );
      })}
    </>
  );
};

const BeatExample: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileLabel name={copy.reflect.exampleFile} delay={2} />
      <div style={{ height: 22 }} />
      <CodeBlock
        code={reflectionExample}
        groupOf={reflectGroupOf}
        reveal={progress(frame, 8, 90)}
        wash={{
          schema: progress(frame, 110, 24),
          context: progress(frame, 140, 24),
        }}
        fontSize={20}
      />
      <div style={{ height: 26 }} />
      <Note delay={176} size={27} maxWidth={1440} color={colors.ink}>
        {copy.reflect.exampleNote}
      </Note>
      <div style={{ height: 12 }} />
      <Note delay={250} size={27} maxWidth={1440}>
        {copy.reflect.exampleNote2}
      </Note>
    </>
  );
};

export const S5Reflection: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.reflect.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatRule />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatTable />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatExample />
      </Sequence>
    </Stage>
  );
};
