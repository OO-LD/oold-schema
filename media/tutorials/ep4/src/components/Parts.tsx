import React from 'react';
import { useFrame } from '@rendiv/core';
import { Kicker } from '../../../shared/components/Type';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, progress } from '../../../shared/lib/motion';

export const SceneKicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', top: 62, left: 0, right: 0 }}>
    <Kicker color={colors.muted}>{children}</Kicker>
  </div>
);

export const SceneTitle: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  maxWidth?: number;
}> = ({ children, delay = 0, size = type.headlineSm.size, maxWidth = 1500 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: type.headlineSm.weight,
        lineHeight: type.headlineSm.leading,
        letterSpacing: -0.9,
        color: colors.ink,
        maxWidth,
        ...enterUp(frame, delay, 22, 24),
      }}
    >
      {children}
    </div>
  );
};

export const Note: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  maxWidth?: number;
}> = ({ children, delay = 0, size = 29, color = colors.muted, maxWidth = 1340 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.42,
        color,
        maxWidth,
        ...enterUp(frame, delay, 20, 18),
      }}
    >
      {children}
    </div>
  );
};

export const PanelLabel: React.FC<{
  text: string;
  color?: string;
  delay?: number;
  align?: 'left' | 'center';
}> = ({ text, color = colors.muted, delay = 0, align = 'left' }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: type.label.size,
        fontWeight: type.label.weight,
        letterSpacing: type.label.tracking,
        textTransform: 'uppercase',
        color,
        marginBottom: 12,
        textAlign: align,
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {text}
    </div>
  );
};

export const FileLabel: React.FC<{ name: string; delay?: number }> = ({ name, delay = 0 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: fonts.mono,
        fontSize: 24,
        fontWeight: 600,
        color: colors.oold_ink,
        background: colors.oold_wash,
        border: `2px solid ${brand.oold}55`,
        borderRadius: 10,
        padding: '7px 18px',
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      {name}
    </div>
  );
};

export const MonoChip: React.FC<{
  text: string;
  color?: string;
  delay?: number;
  size?: number;
}> = ({ text, color = colors.ink, delay = 0, size = 26 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: fonts.mono,
        fontSize: size,
        color,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 12,
        padding: '12px 20px',
        whiteSpace: 'nowrap',
        boxShadow: '0 10px 26px rgba(16,16,16,0.05)',
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      {text}
    </div>
  );
};

export const Statement: React.FC<{
  text: string;
  source: string;
  delay?: number;
  color?: string;
  maxWidth?: number;
  size?: number;
}> = ({ text, source, delay = 0, color = colors.ink, maxWidth = 1320, size = 33 }) => {
  const frame = useFrame();
  return (
    <div style={{ maxWidth, ...enterUp(frame, delay, 22, 20) }}>
      <div style={{ fontSize: size, fontWeight: 600, lineHeight: 1.36, color }}>{text}</div>
      <div
        style={{
          fontSize: type.label.size,
          color: colors.muted,
          marginTop: 10,
          opacity: fadeIn(frame, delay + 16, 16),
        }}
      >
        {source}
      </div>
    </div>
  );
};

export const Bullet: React.FC<{
  text: string;
  color?: string;
  delay?: number;
  size?: number;
}> = ({ text, color = brand.graph, delay = 0, size = 27 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        fontSize: size,
        lineHeight: 1.35,
        color: colors.ink,
        textAlign: 'left',
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          background: color,
          marginTop: size * 0.45,
          flexShrink: 0,
        }}
      />
      <span>{text}</span>
    </div>
  );
};

export const ArrowRight: React.FC<{ delay?: number; width?: number; color?: string }> = ({
  delay = 0,
  width = 90,
  color = colors.muted,
}) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 20);
  const head = fadeIn(frame, delay + 12, 12);
  return (
    <svg width={width} height={32} viewBox={`0 0 ${width} 32`} style={{ flexShrink: 0 }}>
      <path
        d={`M 2 16 L ${width - 18} 16`}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d={`M ${width - 26} 8 L ${width - 14} 16 L ${width - 26} 24`}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={head}
      />
    </svg>
  );
};

export const ArrowDown: React.FC<{ delay?: number; height?: number; color?: string }> = ({
  delay = 0,
  height = 54,
  color = colors.muted,
}) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 18);
  const head = fadeIn(frame, delay + 10, 12);
  return (
    <svg width={32} height={height} viewBox={`0 0 32 ${height}`} style={{ flexShrink: 0 }}>
      <path
        d={`M 16 2 L 16 ${height - 16}`}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d={`M 8 ${height - 24} L 16 ${height - 12} L 24 ${height - 24}`}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={head}
      />
    </svg>
  );
};

// The N-Triples output of a JSON-LD processor, laid out as subject, predicate
// and object columns so the IRIs stay readable.
export const TripleTable: React.FC<{
  rows: [string, string, string][];
  columns: string[];
  delay?: number;
  size?: number;
  stagger?: number;
}> = ({ rows, columns, delay = 0, size = 20, stagger = 22 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 18,
        padding: '26px 34px',
        textAlign: 'left',
        boxShadow: '0 18px 48px rgba(16,16,16,0.06)',
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        columnGap: 30,
        rowGap: 12,
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {columns.map((c, i) => (
        <div
          key={c}
          style={{
            fontSize: type.label.size - 2,
            fontWeight: type.label.weight,
            letterSpacing: type.label.tracking,
            textTransform: 'uppercase',
            color: colors.muted,
            opacity: fadeIn(frame, delay + i * 4, 14),
          }}
        >
          {c}
        </div>
      ))}
      {rows.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              fontFamily: fonts.mono,
              fontSize: size,
              whiteSpace: 'nowrap',
              color: c === 1 ? brand.graph : colors.ink,
              fontWeight: c === 1 ? 600 : 400,
              opacity: fadeIn(frame, delay + 14 + r * stagger + c * 6, 14),
            }}
          >
            {cell}
          </div>
        )),
      )}
    </div>
  );
};

export const GraphNode: React.FC<{
  id: string;
  type: string;
  delay?: number;
}> = ({ id, type: rdfType, delay = 0 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        background: colors.panel,
        border: `2px solid ${brand.graph}55`,
        borderRadius: 16,
        padding: '18px 26px',
        textAlign: 'center',
        boxShadow: '0 14px 34px rgba(94,47,163,0.10)',
        ...enterUp(frame, delay, 20, 18),
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: 600, color: colors.ink }}>
        {id}
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 22,
          color: brand.graph,
          marginTop: 6,
        }}
      >
        {rdfType}
      </div>
    </div>
  );
};

export const GraphEdge: React.FC<{ label: string; delay?: number; width?: number }> = ({
  label,
  delay = 0,
  width = 320,
}) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 24);
  const head = fadeIn(frame, delay + 16, 12);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 23,
          fontWeight: 600,
          color: brand.graph,
          marginBottom: 10,
          opacity: fadeIn(frame, delay + 8, 16),
        }}
      >
        {label}
      </div>
      <svg width={width} height={26} viewBox={`0 0 ${width} 26`}>
        <path
          d={`M 4 13 L ${width - 18} 13`}
          stroke={brand.graph}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d={`M ${width - 26} 5 L ${width - 12} 13 L ${width - 26} 21`}
          stroke={brand.graph}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={head}
        />
      </svg>
    </div>
  );
};
