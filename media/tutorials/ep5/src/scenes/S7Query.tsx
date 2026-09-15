import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconStore } from '../../../shared/components/Icons';
import { brand, colors, OVERLAP } from '../../../shared/theme';
import { fadeIn, pop, progress, sceneOpacity } from '../../../shared/lib/motion';
import { PyBlock } from '../components/CodeCard';
import { Lead, NoteCard, SceneKicker, Table } from '../components/Parts';
import {
  copy,
  queryConditionPy,
  queryListPy,
  querySparqlPy,
  querySubscriptPy,
} from '../copy';
import { sceneById } from '../timeline';

// The last technical scene. It is both a highlight and experimental, so it
// gets the screen time of a highlight and the label sits in the kicker for
// every beat the label applies to. The pill stays up for the whole scene:
// the backend beat still shows the DSL translated to SPARQL, which is the
// experimental part, so the label boundary must not sit mid-scene.
// table: three shipped stores are not the experimental part.
const scene = sceneById('S7');
const A = 210;
const B = 210;
const C = 210;
const D = 230;
const E = 200;
const F = scene.duration - A - B - C - D - E;

const BeatSubscript: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      <IconStore
        size={92}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 22 }} />
      <Lead delay={12} maxWidth={1300}>
        {copy.query.subscriptLead}
      </Lead>
      <div style={{ height: 34 }} />
      <div style={{ opacity: fadeIn(frame, 22, 16) }}>
        <PyBlock code={querySubscriptPy} fontSize={28} reveal={progress(frame, 24, 42)} />
      </div>
      <div style={{ height: 34 }} />
      <Caption delay={82} size={29} maxWidth={1420}>
        {copy.query.subscriptSub}
      </Caption>
    </>
  );
};

const BeatCondition: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1400}>
        {copy.query.conditionLead}
      </Lead>
      <div style={{ height: 30 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={queryConditionPy} fontSize={25} reveal={progress(frame, 12, 52)} />
      </div>
      <div style={{ height: 30 }} />
      <Caption delay={78} size={28} maxWidth={1480}>
        {copy.query.conditionSub}
      </Caption>
    </>
  );
};

const BeatList: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1400}>
        {copy.query.listLead}
      </Lead>
      <div style={{ height: 36 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={queryListPy} fontSize={27} reveal={progress(frame, 12, 42)} />
      </div>
      <div style={{ height: 36 }} />
      <Caption delay={70} size={29} maxWidth={1460}>
        {copy.query.listSub}
      </Caption>
    </>
  );
};

const BeatSparql: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.query.sparqlLead}
      </Lead>
      <div style={{ height: 32 }} />
      <div style={{ opacity: fadeIn(frame, 10, 16) }}>
        <PyBlock code={querySparqlPy} fontSize={25} reveal={progress(frame, 12, 48)} />
      </div>
      <div style={{ height: 32 }} />
      <Caption delay={70} size={28} maxWidth={1520}>
        {copy.query.sparqlSub}
      </Caption>
    </>
  );
};

// The honest half of the highlight, on its own beat so it is not a footnote
// under the code that sells it.
const BeatLimits: React.FC = () => {
  const frame = useFrame();
  const close = progress(frame, 24, 34);

  return (
    <>
      <Lead delay={0} maxWidth={1400}>
        {copy.query.limitsLead}
      </Lead>
      <div style={{ height: 38 }} />
      <div style={{ display: 'flex', gap: 34, alignItems: 'stretch' }}>
        <NoteCard
          name={copy.query.limits[0].name}
          code={copy.query.limits[0].code}
          text={copy.query.limits[0].text}
          delay={20}
          slide={(1 - close) * -50}
          color={brand.code}
          width={720}
        />
        <NoteCard
          name={copy.query.limits[1].name}
          code={copy.query.limits[1].code}
          text={copy.query.limits[1].text}
          delay={34}
          slide={(1 - close) * 50}
          // Not brand.store: orange is storage and APIs across the series, and
          // the next beat uses it for backends that do work. Absence reads red.
          color={brand.doc}
          width={720}
        />
      </div>
      <div style={{ height: 38 }} />
      <Caption delay={86} size={28} maxWidth={1440}>
        {copy.query.limitsSub}
      </Caption>
    </>
  );
};

const COLS = [500, 480, 450];

const cellColor = (row: string[], col: number): string => {
  if (col !== 2) return col === 0 ? brand.code : colors.ink;
  return row[2].includes('not implemented') ? colors.muted : brand.store;
};

const BeatTable: React.FC = () => {
  return (
    <>
      <Lead delay={0} maxWidth={1300}>
        {copy.query.tableLead}
      </Lead>
      <div style={{ height: 34 }} />
      <Table head={copy.query.tableHead} rows={copy.query.table} cols={COLS} colorOf={cellColor} />
      <div style={{ height: 34 }} />
      <Caption delay={72} size={29} maxWidth={1300}>
        {copy.query.tableSub}
      </Caption>
    </>
  );
};

export const S7Query: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker tag={copy.query.experimental}>
        {copy.query.kicker}
      </SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatSubscript />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatCondition />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C} layout="none">
        <BeatList />
      </Sequence>
      <Sequence from={A + B + C} durationInFrames={D} layout="none">
        <BeatSparql />
      </Sequence>
      <Sequence from={A + B + C + D} durationInFrames={E} layout="none">
        <BeatLimits />
      </Sequence>
      <Sequence from={A + B + C + D + E} durationInFrames={F + OVERLAP} layout="none">
        <BeatTable />
      </Sequence>
    </Stage>
  );
};
