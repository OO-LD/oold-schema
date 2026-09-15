import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, personContext } from '../copy';
import { sceneById } from '../timeline';
import { FileLabel, Note, SceneKicker } from '../components/Parts';

const scene = sceneById('S5b');

const MergeCard: React.FC<{
  index: string;
  title: string;
  text: string;
  delay: number;
  mono?: boolean;
}> = ({ index, title, text, delay, mono = false }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 620,
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        background: colors.panel,
        border: `3px solid ${brand.graph}26`,
        borderRadius: 16,
        padding: '22px 26px',
        textAlign: 'left',
        ...enterUp(frame, delay, 20, 18),
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          background: brand.graph,
          color: colors.panel,
          fontSize: 26,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {index}
      </div>
      <div>
        <div
          style={{
            fontFamily: mono ? fonts.mono : undefined,
            fontSize: mono ? 24 : 26,
            fontWeight: 600,
            color: brand.graph,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 25, color: colors.muted, marginTop: 6, lineHeight: 1.35 }}>
          {text}
        </div>
      </div>
    </div>
  );
};

// Geometry of the personContext block, so the gutter markers sit exactly on the
// lines their card describes. Line 2 is the inherited entry, lines 3 to 9 are the
// schema's own object.
const MERGE_FONT = 24;
const MERGE_ROW = MERGE_FONT * type.code.leading;
const MERGE_TOP = 36; // 2px border + 34px padding
const rowsTop = (firstLine: number) => MERGE_TOP + (firstLine - 1) * MERGE_ROW;

const CARD_DELAY = [30, 76];

const MergeMarker: React.FC<{ index: string; firstLine: number; lines: number; delay: number }> = ({
  index,
  firstLine,
  lines,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: rowsTop(firstLine) + 4,
        height: lines * MERGE_ROW - 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: fadeIn(frame, delay, 18),
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: brand.graph,
          color: colors.panel,
          fontSize: 19,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {index}
      </div>
      <div style={{ width: 4, height: '100%', borderRadius: 2, background: `${brand.graph}59` }} />
    </div>
  );
};

export const S5bMerge: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.reflect.mergeKicker}</SceneKicker>

      <FileLabel name={copy.isA.personFile} delay={2} />
      <div style={{ height: 24 }} />
      <div style={{ display: 'flex', gap: 44, alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            textAlign: 'left',
            opacity: fadeIn(frame, 4, 18),
          }}
        >
          <div style={{ position: 'relative', width: 52, marginRight: 14, alignSelf: 'stretch' }}>
            <MergeMarker index="1" firstLine={2} lines={1} delay={CARD_DELAY[0]} />
            <MergeMarker index="2" firstLine={3} lines={7} delay={CARD_DELAY[1]} />
          </div>
          <CodeBlock
            code={personContext}
            groupOf={() => 'context'}
            reveal={progress(frame, 4, 66)}
            wash={{ context: progress(frame, 100, 26) }}
            fontSize={MERGE_FONT}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <MergeCard
            index={copy.reflect.mergeLabels[0].index}
            title={copy.reflect.mergeLabels[0].title}
            text={copy.reflect.mergeLabels[0].text}
            delay={CARD_DELAY[0]}
            mono
          />
          <MergeCard
            index={copy.reflect.mergeLabels[1].index}
            title={copy.reflect.mergeLabels[1].title}
            text={copy.reflect.mergeLabels[1].text}
            delay={CARD_DELAY[1]}
          />
        </div>
      </div>
      <div style={{ height: 32 }} />
      <Note delay={106} size={29} maxWidth={1440}>
        {copy.reflect.mergeNote}
      </Note>
      <div style={{ height: 16 }} />
      <div
        style={{
          fontSize: type.label.size,
          color: colors.muted,
          opacity: fadeIn(frame, 134, 18),
        }}
      >
        {copy.reflect.mergeSource}
      </div>
    </Stage>
  );
};
