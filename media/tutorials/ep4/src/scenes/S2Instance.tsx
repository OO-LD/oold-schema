import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { colors } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { FileLabel, Note, SceneKicker, SceneTitle } from '../components/Parts';
import { copy, rdfPersonInstance, rdfPersonSchema, rdfPersonSchemaContextLines } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S2');

const schemaGroup = (lineNo: number): Group =>
  rdfPersonSchemaContextLines.includes(lineNo) ? 'context' : 'schema';

// Line 2 is $schema, line 3 is @context in RdfPerson.instance.json.
const instanceGroup = (lineNo: number): Group =>
  lineNo === 2 ? 'schema' : lineNo === 3 ? 'context' : 'plain';

export const S2Instance: React.FC = () => {
  const frame = useFrame();
  const highlight = fadeIn(frame, 230, 20);

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.instance.kicker}</SceneKicker>
      <SceneTitle>{copy.instance.title}</SceneTitle>

      <div style={{ height: 28 }} />
      <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'left' }}>
          <FileLabel name={copy.instance.schemaFile} delay={12} />
          <div style={{ height: 12 }} />
          <div style={{ opacity: fadeIn(frame, 20, 18) }}>
            <CodeBlock
              code={rdfPersonSchema}
              groupOf={schemaGroup}
              fontSize={20}
              reveal={progress(frame, 26, 90)}
            />
          </div>
        </div>

        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 140, 20) }}>
          <FileLabel name={copy.instance.instanceFile} delay={140} />
          <div style={{ height: 12 }} />
          <CodeBlock
            code={rdfPersonInstance}
            groupOf={instanceGroup}
            fontSize={22}
            reveal={progress(frame, 150, 60)}
            wash={{ context: highlight, schema: highlight }}
          />
        </div>
      </div>

      <div style={{ height: 30 }} />
      <Note delay={260} maxWidth={1500} color={colors.ink}>
        {copy.instance.note}
      </Note>

      <div style={{ height: 14 }} />
      <Note delay={320} maxWidth={1500} color={colors.oold_ink}>
        {copy.instance.turn}
      </Note>
    </Stage>
  );
};
