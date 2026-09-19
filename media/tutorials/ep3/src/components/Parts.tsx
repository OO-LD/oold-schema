import React from 'react';
import { useFrame } from '@rendiv/core';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { Kicker } from '../../../shared/components/Type';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, progress } from '../../../shared/lib/motion';

// A function, not a table: applyTheme swaps the palette after this module is
// imported, so a table built here would ink the dark render with light values.
export const groupInk = (g: Group): string =>
  g === 'context'
    ? colors.graph
    : g === 'schema'
      ? colors.validate
      : g === 'oold'
        ? colors.oold_ink
        : colors.muted;

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

// A schema the subject file references. Muted, so the file the slide is about
// keeps the amber and stays the subject of the picture.
const RefNode: React.FC<{ name: string; delay?: number }> = ({ name, delay = 0 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 24,
        color: colors.muted,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 10,
        padding: '8px 18px',
        whiteSpace: 'nowrap',
        ...enterUp(frame, delay, 18, 14),
      }}
    >
      {name}
    </div>
  );
};

// The connector carries the relation. The arrow sits on the row's centre line
// and the label floats above it, so the nodes stay aligned with each other.
const RefEdge: React.FC<{
  label: string;
  direction: 'left' | 'right';
  delay?: number;
  width?: number;
}> = ({ label, direction, delay = 0, width = 190 }) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 20);
  const head = fadeIn(frame, delay + 14, 12);
  const toLeft = direction === 'left';
  return (
    <div style={{ position: 'relative', width, height: 18, margin: '0 14px', flexShrink: 0 }}>
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: 0,
          right: 0,
          fontFamily: fonts.mono,
          fontSize: 21,
          color: colors.muted,
          whiteSpace: 'nowrap',
          opacity: fadeIn(frame, delay + 6, 14),
        }}
      >
        {label}
      </div>
      <svg width={width} height={18} viewBox={`0 0 ${width} 18`}>
        <path
          d={toLeft ? `M ${width - 4} 9 L 16 9` : `M 4 9 L ${width - 16} 9`}
          stroke={colors.muted}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d={
            toLeft
              ? 'M 24 3 L 12 9 L 24 15'
              : `M ${width - 24} 3 L ${width - 12} 9 L ${width - 24} 15`
          }
          stroke={colors.muted}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={head}
        />
      </svg>
    </div>
  );
};

export type RefLink = { label: string; file: string };

// The composed document as a node-link row, in place of the bare file name: the
// file the slide is about in the middle, the schemas its $refs point at beside
// it, and the relation on the connector. Both moves can be on one row, which is
// what tells the extension at the root apart from the embedded object.
export const RefGraph: React.FC<{
  file: string;
  isA?: RefLink;
  hasA?: RefLink;
  delay?: number;
}> = ({ file, isA, hasA, delay = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {isA ? (
      <>
        <RefNode name={isA.file} delay={delay + 14} />
        <RefEdge label={isA.label} direction="left" delay={delay + 8} />
      </>
    ) : null}
    <FileLabel name={file} delay={delay} />
    {hasA ? (
      <>
        <RefEdge label={hasA.label} direction="right" delay={delay + 8} />
        <RefNode name={hasA.file} delay={delay + 14} />
      </>
    ) : null}
  </div>
);

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
              <PanelLabel text={p.label} color={groupInk(p.group)} delay={p.delay ?? 0} />
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
