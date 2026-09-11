import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../components/Stage';
import { Headline } from '../components/Type';
import { copy } from '../copy';
import { brand, colors, fonts, sceneById, type } from '../theme';
import { enterUp, fadeIn, pop, sceneOpacity } from '../lib/motion';

const scene = sceneById('S1');

const CELL = 336;
const GAP = 92;

const Cell: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const s = pop(frame, fps, delay, 16);
  return (
    <div
      style={{
        width: CELL,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 12,
        padding: '18px 24px',
        textAlign: 'left',
        fontFamily: fonts.mono,
        fontSize: 29,
        color: colors.ink,
        boxShadow: '0 10px 26px rgba(16,16,16,0.045)',
        opacity: fadeIn(frame, delay, 16),
        transform: `translateY(${(1 - s) * 20}px)`,
      }}
    >
      {text}
    </div>
  );
};

// Sits in the gap between two cells: a dashed line that never connects.
const Break: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const line = fadeIn(frame, delay, 16);
  const x = pop(frame, fps, delay + 14, 13);
  return (
    <svg width={GAP} height={44} viewBox={`0 0 ${GAP} 44`} style={{ flexShrink: 0 }}>
      <path
        d={`M 4 22 L ${GAP / 2 - 16} 22`}
        stroke={colors.hairline}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="8 10"
        opacity={line}
      />
      <path
        d={`M ${GAP / 2 + 16} 22 L ${GAP - 4} 22`}
        stroke={colors.hairline}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="8 10"
        opacity={line}
      />
      <g
        stroke={brand.doc}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={x}
        transform={`translate(${GAP / 2} 22) scale(${x}) translate(${-GAP / 2} -22)`}
      >
        <path d={`M ${GAP / 2 - 9} 13 L ${GAP / 2 + 9} 31`} />
        <path d={`M ${GAP / 2 + 9} 13 L ${GAP / 2 - 9} 31`} />
      </g>
    </svg>
  );
};

const Row: React.FC<{
  domain: string;
  field: string;
  cells: string[];
  delay: number;
}> = ({ domain, field, cells, delay }) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
      <div
        style={{
          width: 286,
          textAlign: 'right',
          ...enterUp(frame, delay, 18, 16),
        }}
      >
        <div style={{ fontSize: 27, fontWeight: 700, color: colors.ink }}>{domain}</div>
        <div style={{ fontSize: 24, color: colors.muted, marginTop: 2 }}>{field}</div>
      </div>
      <Cell text={cells[0]} delay={delay + 6} />
      <Break delay={delay + 44} />
      <Cell text={cells[1]} delay={delay + 14} />
      <Break delay={delay + 52} />
      <Cell text={cells[2]} delay={delay + 22} />
    </div>
  );
};

export const S1Hook: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)} justify="space-between">
      <Headline
        groups={copy.hook.lines}
        delay={0}
        stagger={24}
        size={type.headlineSm.size}
        leading={type.headlineSm.leading}
        maxWidth={1500}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {copy.hook.rows.map((r, i) => (
          <Row key={r.domain} {...r} delay={54 + i * 26} />
        ))}
      </div>

      <div
        style={{
          fontSize: 50,
          fontWeight: 700,
          letterSpacing: -0.6,
          color: colors.ink,
          ...enterUp(frame, 246, 24, 24),
        }}
      >
        {copy.hook.punch}
      </div>
    </Stage>
  );
};
