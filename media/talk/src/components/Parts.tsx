import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { colors, fonts, type } from '../theme';
import { enterUp, fadeIn, pop, progress } from '../lib/motion';

// The one sentence a beat exists to land, optionally with the qualifier that
// keeps it honest underneath.
export const Punch: React.FC<{
  text: string;
  sub?: string;
  delay?: number;
  size?: number;
  maxWidth?: number;
}> = ({ text, sub, delay = 0, size = 64, maxWidth = 1500 }) => {
  const frame = useFrame();
  return (
    <div style={{ maxWidth }}>
      <div
        style={{
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.22,
          letterSpacing: -1.1,
          color: colors.ink,
          ...enterUp(frame, delay, 24, 28),
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            fontSize: type.caption.size,
            lineHeight: type.caption.leading,
            color: colors.muted,
            marginTop: 30,
            ...enterUp(frame, delay + 22, 22, 20),
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

export const Chip: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  mono?: boolean;
  size?: number;
}> = ({ children, delay = 0, color, mono = false, size = 30 }) => {
  const frame = useFrame();
  const ink = color ?? colors.ink;
  return (
    <span
      style={{
        fontFamily: mono ? fonts.mono : fonts.sans,
        fontSize: size,
        fontWeight: mono ? 400 : 600,
        color: ink,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 12,
        padding: '12px 22px',
        whiteSpace: 'nowrap',
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      {children}
    </span>
  );
};

export const Row: React.FC<{
  children: React.ReactNode;
  gap?: number;
  wrap?: boolean;
  align?: 'center' | 'flex-start' | 'stretch';
}> = ({ children, gap = 26, wrap = false, align = 'center' }) => (
  <div
    style={{
      display: 'flex',
      gap,
      alignItems: align,
      justifyContent: 'center',
      flexWrap: wrap ? 'wrap' : 'nowrap',
    }}
  >
    {children}
  </div>
);

// The two-standards panel the explainer and the tutorial series both use: a
// mark, a name, what it gives you, and the keywords it is recognised by.
export const StandardPanel: React.FC<{
  color: string;
  wash: string;
  Icon: React.FC<{ size?: number }>;
  label: string;
  sub: string;
  tokens: string[];
  delay?: number;
  offset?: number;
  width?: number;
}> = ({ color, wash, Icon, label, sub, tokens, delay = 0, offset = 0, width = 560 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width,
        background: wash,
        border: `3px solid ${color}22`,
        borderRadius: 20,
        padding: '32px 36px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 20),
        transform: `translateX(${offset}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 8 }}>
        <Icon size={68} />
        <div>
          <div style={{ fontSize: 38, fontWeight: 700, color }}>{label}</div>
          <div style={{ fontSize: 25, color: colors.muted }}>{sub}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
        {tokens.map((t, i) => (
          <span
            key={t}
            style={{
              fontFamily: fonts.mono,
              fontSize: 25,
              color,
              background: colors.panel,
              border: `2px solid ${color}33`,
              borderRadius: 9,
              padding: '7px 15px',
              opacity: fadeIn(frame, delay + 24 + i * 10, 14),
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export const Card: React.FC<{
  title: string;
  body: string;
  delay?: number;
  width?: number;
  accent?: string;
}> = ({ title, body, delay = 0, width = 460, accent }) => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const s = pop(frame, fps, delay, 15);
  return (
    <div
      style={{
        width,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderTop: `6px solid ${accent ?? colors.hairline}`,
        borderRadius: 18,
        padding: '30px 32px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 16),
        transform: `translateY(${(1 - s) * 22}px)`,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25, color: colors.ink }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 27,
          lineHeight: 1.42,
          color: colors.muted,
          marginTop: 16,
        }}
      >
        {body}
      </div>
    </div>
  );
};

// A short connector between two blocks in a flow. Drawn rather than typed,
// because an arrow written as characters is exactly the kind of thing that
// turns into a double hyphen.
export const Arrow: React.FC<{ delay?: number; width?: number; vertical?: boolean }> = ({
  delay = 0,
  width = 76,
  vertical = false,
}) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 18);
  const w = vertical ? 40 : width;
  const h = vertical ? width : 40;
  const line = vertical
    ? `M 20 4 L 20 ${h - 14}`
    : `M 4 20 L ${w - 14} 20`;
  const head = vertical
    ? `M 12 ${h - 18} L 20 ${h - 6} L 28 ${h - 18}`
    : `M ${w - 18} 12 L ${w - 6} 20 L ${w - 18} 28`;
  return (
    <svg width={w} height={h} style={{ opacity: fadeIn(frame, delay, 12), flexShrink: 0 }}>
      <path
        d={line}
        stroke={colors.hairline}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d={head}
        stroke={colors.hairline}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={draw}
      />
    </svg>
  );
};

export const Note: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  maxWidth?: number;
  color?: string;
}> = ({ children, delay = 0, size = type.caption.size, maxWidth = 1360, color }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: type.caption.leading,
        color: color ?? colors.muted,
        maxWidth,
        ...enterUp(frame, delay, 22, 18),
      }}
    >
      {children}
    </div>
  );
};

export const Gap: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h }} />;
