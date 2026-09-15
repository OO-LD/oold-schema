import React from 'react';
import { useFrame } from '@rendiv/core';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { Kicker } from '../../../shared/components/Type';
import { colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn } from '../../../shared/lib/motion';

// CodeBlock geometry, needed to lay a scrim over the lines that are not in focus
// and to tint single lines in a colour CodeBlock has no group for.
const CARD_BORDER = 2;
const CARD_PAD_Y = 34;
const CARD_PAD_X = 42;
const WASH_BLEED = 14;
const lineHeight = (fontSize: number) => fontSize * type.code.leading;

export const groupPicker =
  (context: number[], structure: number[]) =>
  (lineNo: number): Group =>
    context.includes(lineNo) ? 'context' : structure.includes(lineNo) ? 'schema' : 'plain';

export const only =
  (lines: number[], group: Group) =>
  (lineNo: number): Group =>
    lines.includes(lineNo) ? group : 'plain';

type FileViewProps = {
  code: string;
  groupOf: (lineNo: number) => Group;
  wash?: Partial<Record<Group, number>>;
  reveal?: number;
  fontSize?: number;
  focus?: number[];
  scrim?: number;
  accent?: number[];
  accentAmount?: number;
};

// A code card that can push every line outside `focus` behind a white scrim and
// wash the `accent` lines amber. CodeBlock has three line groups, blue, purple
// and neutral, so the OO-LD amber of the design system is laid on top here.
export const FileView: React.FC<FileViewProps> = ({
  code,
  groupOf,
  wash,
  reveal = 1,
  fontSize = type.code.size,
  focus,
  scrim = 0,
  accent,
  accentAmount = 0,
}) => {
  const lines = code.split('\n');
  const lh = lineHeight(fontSize);
  const shown = reveal * lines.length;
  return (
    <div style={{ position: 'relative' }}>
      <CodeBlock code={code} groupOf={groupOf} wash={wash} reveal={reveal} fontSize={fontSize} />
      {accent && accentAmount > 0
        ? accent.map((lineNo) => {
            const idx = lineNo - 1;
            const local = Math.max(0, Math.min(1, shown - idx));
            return (
              <div
                key={`accent-${lineNo}`}
                style={{
                  position: 'absolute',
                  left: CARD_BORDER + CARD_PAD_X - WASH_BLEED,
                  right: CARD_BORDER + CARD_PAD_X - WASH_BLEED,
                  top: CARD_BORDER + CARD_PAD_Y + idx * lh - 2,
                  height: lh + 4,
                  borderRadius: 6,
                  background: colors.oold_wash,
                  mixBlendMode: 'multiply',
                  opacity: accentAmount * local,
                  transform: `scaleX(${accentAmount})`,
                  transformOrigin: 'left center',
                }}
              />
            );
          })
        : null}
      {focus && scrim > 0
        ? lines.map((_, idx) =>
            focus.includes(idx + 1) ? null : (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: CARD_BORDER,
                  right: CARD_BORDER,
                  top: CARD_BORDER + CARD_PAD_Y + idx * lh,
                  height: lh,
                  background: colors.panel,
                  opacity: scrim,
                }}
              />
            ),
          )
        : null}
    </div>
  );
};

export const FileLabel: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: type.label.size,
        fontWeight: type.label.weight,
        letterSpacing: type.label.tracking,
        color: colors.muted,
        marginBottom: 18,
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {children}
    </div>
  );
};

export const TopKicker: React.FC<{ children: React.ReactNode; color?: string; top?: number }> = ({
  children,
  color = colors.muted,
  top = 64,
}) => (
  <div style={{ position: 'absolute', top, left: 0, right: 0 }}>
    <Kicker color={color}>{children}</Kicker>
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  size?: number;
}> = ({ children, color = colors.ink, delay = 0, size = 26 }) => {
  const frame = useFrame();
  return (
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: size,
        color,
        background: colors.panel,
        border: `2px solid ${color}33`,
        borderRadius: 10,
        padding: '9px 17px',
        whiteSpace: 'pre',
        opacity: fadeIn(frame, delay, 14),
      }}
    >
      {children}
    </span>
  );
};

// A monospace fragment with its plain-language gloss underneath.
export const DefRow: React.FC<{
  code: string;
  note: string;
  color?: string;
  delay?: number;
  codeSize?: number;
  noteSize?: number;
  width?: number;
}> = ({
  code,
  note,
  color = colors.schema,
  delay = 0,
  codeSize = 26,
  noteSize = 27,
  width = 1180,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width,
        textAlign: 'left',
        borderLeft: `4px solid ${color}44`,
        paddingLeft: 26,
        ...enterUp(frame, delay, 20, 18),
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: codeSize,
          fontWeight: 600,
          color,
          whiteSpace: 'pre',
        }}
      >
        {code}
      </div>
      <div style={{ fontSize: noteSize, color: colors.muted, marginTop: 4 }}>{note}</div>
    </div>
  );
};

// A sentence quoted from the documentation with its source underneath, in the
// muted sans the series uses for attribution.
export const Statement: React.FC<{
  text: string;
  source: string;
  delay?: number;
  size?: number;
  color?: string;
  maxWidth?: number;
}> = ({ text, source, delay = 0, size = type.caption.size, color = colors.ink, maxWidth = 1380 }) => {
  const frame = useFrame();
  return (
    <div style={{ maxWidth, ...enterUp(frame, delay, 22, 20) }}>
      <div style={{ fontSize: size, fontWeight: 600, lineHeight: 1.38, color }}>{text}</div>
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
    </div>
  );
};

export const Bullet: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  width?: number;
  size?: number;
}> = ({ children, color = colors.muted, delay = 0, width = 1240, size = type.body.size }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        alignItems: 'flex-start',
        width,
        textAlign: 'left',
        ...enterUp(frame, delay, 20, 16),
      }}
    >
      <div
        style={{
          width: 11,
          height: 11,
          borderRadius: 6,
          background: color,
          marginTop: size * 0.55,
          flexShrink: 0,
        }}
      />
      <div style={{ fontSize: size, lineHeight: type.body.leading, color: colors.ink }}>
        {children}
      </div>
    </div>
  );
};

// The labelled, tinted panel used whenever the two roles stand side by side.
export const Panel: React.FC<{
  color: string;
  wash: string;
  Icon: React.FC<{ size?: number }>;
  label: string;
  sub: string;
  tokens: string[];
  delay?: number;
  width?: number;
}> = ({ color, wash, Icon, label, sub, tokens, delay = 0, width = 600 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width,
        background: wash,
        border: `3px solid ${color}22`,
        borderRadius: 20,
        padding: '30px 34px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 20),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
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
              opacity: fadeIn(frame, delay + 22 + i * 9, 14),
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export const Spacer: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h }} />;
