import React from 'react';
import { useFrame } from '@rendiv/core';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { Kicker } from '../../../shared/components/Type';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn } from '../../../shared/lib/motion';

export const groupInk: Record<Group, string> = {
  context: brand.graph,
  schema: brand.validate,
  plain: colors.muted,
};

export const SceneKicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', top: 62, left: 0, right: 0 }}>
    <Kicker color={colors.muted}>{children}</Kicker>
  </div>
);

export const FileLabel: React.FC<{ name: string; delay?: number; color?: string }> = ({
  name,
  delay = 0,
  color = colors.oold_ink,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 26,
        fontWeight: 600,
        color,
        background: colors.oold_wash,
        border: `2px solid ${brand.oold}55`,
        borderRadius: 10,
        padding: '8px 20px',
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      {name}
    </div>
  );
};

export const Note: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  maxWidth?: number;
  opacity?: number;
}> = ({ children, delay = 0, size = 30, color = colors.muted, maxWidth = 1340, opacity = 1 }) => {
  const frame = useFrame();
  const enter = enterUp(frame, delay, 20, 18);
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.4,
        color,
        maxWidth,
        ...enter,
        opacity: enter.opacity * opacity,
      }}
    >
      {children}
    </div>
  );
};

export const PanelLabel: React.FC<{ text: string; color: string; delay?: number }> = ({
  text,
  color,
  delay = 0,
}) => {
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
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {text}
    </div>
  );
};

export type SidePanel = {
  label?: string;
  code: string;
  group: Group;
  reveal?: number;
  wash?: number;
  delay?: number;
};

export const PanelPair: React.FC<{ left: SidePanel; right: SidePanel; fontSize?: number }> = ({
  left,
  right,
  fontSize = 24,
}) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', gap: 44, alignItems: 'flex-start' }}>
      {[left, right].map((p, i) => {
        const wash: Partial<Record<Group, number>> = {};
        wash[p.group] = p.wash ?? 0;
        return (
          <div
            key={i}
            style={{
              textAlign: 'left',
              opacity: fadeIn(frame, p.delay ?? 0, 18),
            }}
          >
            {p.label ? (
              <PanelLabel text={p.label} color={groupInk[p.group]} delay={p.delay ?? 0} />
            ) : null}
            <CodeBlock
              code={p.code}
              groupOf={() => p.group}
              reveal={p.reveal ?? 1}
              wash={wash}
              fontSize={fontSize}
            />
          </div>
        );
      })}
    </div>
  );
};

export const Chip: React.FC<{
  text: string;
  color: string;
  delay?: number;
  size?: number;
}> = ({ text, color, delay = 0, size = 26 }) => {
  const frame = useFrame();
  return (
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: size,
        color,
        background: colors.panel,
        border: `2px solid ${color}33`,
        borderRadius: 9,
        padding: '8px 16px',
        opacity: fadeIn(frame, delay, 14),
      }}
    >
      {text}
    </span>
  );
};

export const Tag: React.FC<{ text: string; color: string; delay?: number }> = ({
  text,
  color,
  delay = 0,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'inline-block',
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: colors.panel,
        background: color,
        borderRadius: 10,
        padding: '6px 20px',
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {text}
    </div>
  );
};

export const Bullet: React.FC<{ text: string; color: string; delay?: number }> = ({
  text,
  color,
  delay = 0,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        fontSize: 27,
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
          marginTop: 12,
          flexShrink: 0,
        }}
      />
      <span>{text}</span>
    </div>
  );
};
