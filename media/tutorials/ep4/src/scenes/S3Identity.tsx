import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { brand, colors } from '../../../shared/theme';
import { fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import {
  ArrowRight,
  MonoChip,
  Note,
  PanelLabel,
  SceneKicker,
  SceneTitle,
  Statement,
} from '../components/Parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S3');

const Step: React.FC<{ label: string; code: string; color: string; delay: number }> = ({
  label,
  code,
  color,
  delay,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <PanelLabel text={label} color={colors.muted} delay={delay} align="center" />
    <MonoChip text={code} color={color} delay={delay + 6} />
  </div>
);

// The arrow has to line up with the chips, not with the middle of the whole
// column. Each Step is a label stacked on a chip, so a bare arrow centred in the
// row sits a label's height too high. Giving the arrow the same invisible label
// puts it in the same box as the chips and keeps it aligned if the label changes.
const StepArrow: React.FC<{ delay: number }> = ({ delay }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ visibility: 'hidden' }} aria-hidden="true">
      <PanelLabel text="x" color={colors.muted} delay={0} align="center" />
    </div>
    <ArrowRight delay={delay} width={78} />
  </div>
);

const Case: React.FC<{
  label: string;
  node: string;
  note: string;
  color: string;
  delay: number;
}> = ({ label, node, note, color, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 560,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <PanelLabel text={label} color={color} delay={delay} align="center" />
      <MonoChip text={node} color={color} delay={delay + 6} size={24} />
      <div
        style={{
          fontSize: 23,
          lineHeight: 1.35,
          color: colors.muted,
          marginTop: 14,
          maxWidth: 520,
          opacity: fadeIn(frame, delay + 20, 16),
        }}
      >
        {note}
      </div>
    </div>
  );
};

export const S3Identity: React.FC = () => {
  const frame = useFrame();
  const chain = copy.identity.chain;

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.identity.kicker}</SceneKicker>
      <SceneTitle>{copy.identity.title}</SceneTitle>

      <div style={{ height: 30 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Step label={chain[0].label} code={chain[0].code} color={brand.graph} delay={40} />
        <StepArrow delay={70} />
        <Step label={chain[1].label} code={chain[1].code} color={colors.ink} delay={90} />
        <StepArrow delay={120} />
        <Step label={chain[2].label} code={chain[2].code} color={brand.graph} delay={140} />
      </div>

      <div style={{ height: 40 }} />
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        <Case
          label={copy.identity.withLabel}
          node={copy.identity.withNode}
          note={copy.identity.withNote}
          color={colors.ink}
          delay={230}
        />
        <Case
          label={copy.identity.withoutLabel}
          node={copy.identity.withoutNode}
          note={copy.identity.withoutNote}
          color={colors.muted}
          delay={280}
        />
      </div>

      <div style={{ height: 34 }} />
      <Statement
        text={copy.identity.statement}
        source={copy.identity.source}
        delay={360}
        maxWidth={1360}
      />

      <div style={{ height: 34 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ fontSize: 26, color: colors.muted, opacity: fadeIn(frame, 470, 18) }}>
          {copy.identity.typeLabel}
        </div>
        <MonoChip text={copy.identity.typeCode} color={brand.graph} delay={486} size={24} />
      </div>

      <div style={{ height: 16 }} />
      <Note delay={520} size={25} maxWidth={1420}>
        {copy.identity.typeNote}
      </Note>
    </Stage>
  );
};
