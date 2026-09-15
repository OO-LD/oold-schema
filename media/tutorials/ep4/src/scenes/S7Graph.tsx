import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { colors } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  FileLabel,
  GraphEdge,
  GraphNode,
  Note,
  SceneKicker,
  SceneTitle,
  Statement,
} from '../components/Parts';
import { copy, owlOrganizationInstance, rdfPersonInstance } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S7');

const instanceGroup = (lineNo: number): Group =>
  lineNo === 2 ? 'schema' : lineNo === 3 ? 'context' : 'plain';

const Doc: React.FC<{ file: string; code: string; delay: number; reveal: number }> = ({
  file,
  code,
  delay,
  reveal,
}) => {
  const frame = useFrame();
  return (
    <div style={{ textAlign: 'left', opacity: fadeIn(frame, delay, 18) }}>
      <FileLabel name={file} delay={delay} />
      <div style={{ height: 12 }} />
      <CodeBlock code={code} groupOf={instanceGroup} fontSize={20} reveal={reveal} />
    </div>
  );
};

export const S7Graph: React.FC = () => {
  const frame = useFrame();
  const nodes = copy.graph.nodes;

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.graph.kicker}</SceneKicker>
      <SceneTitle>{copy.graph.title}</SceneTitle>

      <div style={{ height: 24 }} />
      <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
        <Doc
          file={copy.graph.leftFile}
          code={owlOrganizationInstance}
          delay={20}
          reveal={progress(frame, 28, 90)}
        />
        <Doc
          file={copy.graph.rightFile}
          code={rdfPersonInstance}
          delay={90}
          reveal={progress(frame, 98, 90)}
        />
      </div>

      <div style={{ height: 30 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        <GraphNode id={nodes[0].id} type={nodes[0].type} delay={200} />
        <GraphEdge label={copy.graph.edge} delay={280} width={320} />
        <GraphNode id={nodes[1].id} type={nodes[1].type} delay={240} />
      </div>

      <div style={{ height: 28 }} />
      <Note delay={380} maxWidth={1400} color={colors.ink}>
        {copy.graph.note}
      </Note>

      <div style={{ height: 20 }} />
      <Statement
        text={copy.graph.statement}
        source={copy.graph.source}
        delay={430}
        maxWidth={1420}
        size={31}
      />
    </Stage>
  );
};
