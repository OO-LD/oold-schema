import React from 'react';
import { useFrame } from '@rendiv/core';
import { colors, fonts, type } from '../../shared/theme';
import { enterUp, fadeIn, progress } from '../../shared/lib/motion';

// Everything typographic comes from the shared scale in shared/theme.ts. The
// series runs on two headline tiers: `headline` (82) for the title and close
// cards, `headlineSm` (60) for the title of a scene that also carries content.

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

export const Punch: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  maxWidth?: number;
}> = ({ children, delay = 0, size = type.caption.size, maxWidth = 1500 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 700,
        lineHeight: type.caption.leading,
        letterSpacing: -0.5,
        color: colors.ink,
        maxWidth,
        ...enterUp(frame, delay, 24, 24),
      }}
    >
      {children}
    </div>
  );
};

// A claim from the OO-LD guide. `source` names the page it was taken from and is
// set in muted sans underneath; it is left off where the claim is a promise the
// next episode makes good on rather than a finding this one arrived at.
export const Statement: React.FC<{
  text: string;
  source?: string;
  delay?: number;
  color?: string;
  maxWidth?: number;
}> = ({ text, source, delay = 0, color = colors.ink, maxWidth = 1280 }) => {
  const frame = useFrame();
  return (
    <div style={{ maxWidth, ...enterUp(frame, delay, 22, 20) }}>
      <div
        style={{
          fontSize: type.caption.size,
          fontWeight: 600,
          lineHeight: 1.38,
          color,
        }}
      >
        {text}
      </div>
      {source ? (
        <div
          style={{
            fontSize: type.label.size,
            color: colors.muted,
            marginTop: 12,
            opacity: fadeIn(frame, delay + 16, 16),
          }}
        >
          {source}
        </div>
      ) : null}
    </div>
  );
};

export const Chip: React.FC<{
  text: string;
  delay?: number;
  width?: number;
  size?: number;
  color?: string;
  border?: string;
}> = ({
  text,
  delay = 0,
  width,
  size = type.code.size,
  color = colors.ink,
  border = colors.hairline,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width,
        fontFamily: fonts.mono,
        fontSize: size,
        color,
        background: colors.panel,
        border: `2px solid ${border}`,
        borderRadius: 10,
        padding: '12px 16px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 22px rgba(16,16,16,0.04)',
        ...enterUp(frame, delay, 16, 14),
      }}
    >
      {text}
    </div>
  );
};

export const Arrow: React.FC<{ delay?: number; width?: number; color?: string }> = ({
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

// Two bars crossed by a slash: the two sides are not the same thing.
export const NotEqual: React.FC<{ delay?: number; size?: number; color?: string }> = ({
  delay = 0,
  size = 64,
  color = colors.ink,
}) => {
  const frame = useFrame();
  const bars = fadeIn(frame, delay, 16);
  const slash = progress(frame, delay + 12, 18);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <g stroke={color} strokeWidth={6} strokeLinecap="round" opacity={bars}>
        <path d="M 14 25 L 50 25" />
        <path d="M 14 41 L 50 41" />
      </g>
      <path
        d="M 42 12 L 22 52"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - slash}
      />
    </svg>
  );
};

export const Check: React.FC<{ color: string; delay?: number; size?: number }> = ({
  color,
  delay = 0,
  size = 34,
}) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 18);
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" style={{ opacity: fadeIn(frame, delay, 14) }}>
      <path
        d="M 5 18 L 13 26 L 29 7"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
    </svg>
  );
};

export const YesNo: React.FC<{ yes: boolean; color: string; delay?: number }> = ({
  yes,
  color,
  delay = 0,
}) => {
  const frame = useFrame();
  const show = fadeIn(frame, delay, 16);
  const draw = progress(frame, delay + 6, 18);
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" style={{ opacity: show }}>
      <circle
        cx={28}
        cy={28}
        r={24}
        fill={yes ? color : 'none'}
        stroke={yes ? color : colors.hairline}
        strokeWidth={4}
      />
      {yes ? (
        <path
          d="M 17 29 L 25 37 L 40 20"
          stroke={colors.panel}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      ) : (
        <path
          d="M 18 28 L 38 28"
          stroke={colors.muted}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      )}
    </svg>
  );
};
