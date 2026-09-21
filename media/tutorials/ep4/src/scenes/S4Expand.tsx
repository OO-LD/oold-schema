import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { brand, colors } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  ArrowDown,
  ArrowRight,
  PanelLabel,
  SceneKicker,
  SceneTitle,
  Statement,
  TripleTable,
} from '../components/Parts';
import { copy, rdfPersonExpanded, rdfPersonInstance, rdfPersonTriples } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S4');

const instanceGroup = (lineNo: number): Group =>
  lineNo === 2 ? 'schema' : lineNo === 3 ? 'context' : 'plain';

export const S4Expand: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.expand.kicker}</SceneKicker>
      <SceneTitle>{copy.expand.title}</SceneTitle>

      <div style={{ height: 26 }} />
      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <PanelLabel text={copy.expand.instanceLabel} color={colors.oold_ink} delay={16} />
          <div style={{ opacity: fadeIn(frame, 26, 18) }}>
            <CodeBlock
              code={rdfPersonInstance}
              groupOf={instanceGroup}
              fontSize={23}
              reveal={progress(frame, 32, 100)}
            />
          </div>
        </div>

        <div style={{ padding: '26px 24px 0 24px' }}>
          <ArrowRight delay={150} width={86} />
        </div>

        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 175, 20) }}>
          <PanelLabel text={copy.expand.expandedLabel} color={brand.graph} delay={175} />
          <CodeBlock
            code={rdfPersonExpanded}
            groupOf={() => 'context'}
            fontSize={21}
            reveal={progress(frame, 186, 90)}
          />
        </div>
      </div>

      <div style={{ height: 18 }} />
      <ArrowDown delay={320} height={52} />
      <div style={{ height: 18 }} />

      <div style={{ textAlign: 'left' }}>
        <PanelLabel text={copy.expand.triplesLabel} color={brand.graph} delay={334} />
        <TripleTable
          rows={rdfPersonTriples}
          columns={copy.expand.columns}
          delay={340}
          size={20}
          stagger={40}
        />
      </div>

      <div style={{ height: 26 }} />
      <Statement
        text={copy.expand.claim}
        source={copy.expand.source}
        delay={470}
        maxWidth={1320}
      />
    </Stage>
  );
};
