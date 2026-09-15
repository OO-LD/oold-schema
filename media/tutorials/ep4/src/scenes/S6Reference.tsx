import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock } from '../../../shared/components/CodeBlock';
import { brand, colors } from '../../../shared/theme';
import { fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import {
  FileLabel,
  MonoChip,
  PanelLabel,
  SceneKicker,
  SceneTitle,
  Statement,
} from '../components/Parts';
import { copy, employeeProperty, employeeTerm } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S6');

const SideNote: React.FC<{ text: string; delay: number; maxWidth: number }> = ({
  text,
  delay,
  maxWidth,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: 22,
        lineHeight: 1.36,
        color: colors.muted,
        marginTop: 14,
        maxWidth,
        opacity: fadeIn(frame, delay, 18),
      }}
    >
      {text}
    </div>
  );
};

export const S6Reference: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.reference.kicker}</SceneKicker>
      <SceneTitle>{copy.reference.title}</SceneTitle>

      <div style={{ height: 24 }} />
      <FileLabel name={copy.reference.file} delay={16} />

      <div style={{ height: 22 }} />
      <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 34, 18) }}>
          <PanelLabel text={copy.reference.termLabel} color={brand.graph} delay={34} />
          <CodeBlock code={employeeTerm} groupOf={() => 'context'} fontSize={23} />
          <SideNote text={copy.reference.termNote} delay={90} maxWidth={480} />
        </div>

        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 130, 18) }}>
          <PanelLabel text={copy.reference.propLabel} color={brand.validate} delay={130} />
          <CodeBlock code={employeeProperty} groupOf={() => 'schema'} fontSize={23} />
          <SideNote text={copy.reference.propNote} delay={172} maxWidth={680} />
        </div>
      </div>

      <div style={{ height: 34 }} />
      <Statement
        text={copy.reference.statement}
        source={copy.reference.source}
        delay={230}
        maxWidth={1440}
        size={31}
      />

      <div style={{ height: 30 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ fontSize: 26, color: colors.muted, opacity: fadeIn(frame, 340, 18) }}>
          {copy.reference.instanceLabel}
        </div>
        <MonoChip
          text={copy.reference.instanceCode}
          color={colors.oold_ink}
          delay={356}
          size={25}
        />
      </div>
    </Stage>
  );
};
