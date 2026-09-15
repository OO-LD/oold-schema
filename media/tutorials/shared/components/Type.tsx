import React from 'react';
import { useFrame } from '@rendiv/core';
import { colors, type } from '../theme';
import { enterUp } from '../lib/motion';

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = colors.muted,
  delay = 0,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: type.kicker.size,
        fontWeight: type.kicker.weight,
        letterSpacing: type.kicker.tracking,
        textTransform: 'uppercase',
        color,
        marginBottom: 34,
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      {children}
    </div>
  );
};

export const Headline: React.FC<{
  groups: string[];
  delay?: number;
  stagger?: number;
  size?: number;
  maxWidth?: number;
  leading?: number;
}> = ({
  groups,
  delay = 0,
  stagger = 22,
  size = type.headline.size,
  maxWidth = 1500,
  leading = type.headline.leading,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: type.headline.weight,
        lineHeight: leading,
        letterSpacing: -1.2,
        maxWidth,
      }}
    >
      {groups.map((g, i) => (
        <div key={g} style={enterUp(frame, delay + i * stagger, 26, 34)}>
          {g}
        </div>
      ))}
    </div>
  );
};

export const Caption: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  maxWidth?: number;
}> = ({ children, delay = 0, size = type.caption.size, color = colors.muted, maxWidth = 1300 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: type.caption.weight,
        lineHeight: type.caption.leading,
        color,
        maxWidth,
        ...enterUp(frame, delay, 22, 22),
      }}
    >
      {children}
    </div>
  );
};

export const Rule: React.FC<{ delay?: number; width?: number; color?: string }> = ({
  delay = 0,
  width = 220,
  color = colors.hairline,
}) => {
  const frame = useFrame();
  const grow = Math.max(0, Math.min(1, (frame - delay) / 24));
  return (
    <div
      style={{
        height: 4,
        width: width * grow,
        background: color,
        borderRadius: 2,
      }}
    />
  );
};
