import React from 'react';
import { useFrame } from '@rendiv/core';
import { Headline, Kicker } from '../../../shared/components/Type';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { fadeIn } from '../../../shared/lib/motion';

// A status tag, not a decoration: it carries a word and the word is the point.
// The default takes the muted ink, which carries no icon meaning in the series
// palette. The status pill shares a frame with IconStore in the query scene and
// with IconOOLD in the codegen scene, so any brand hue here would read as a
// second icon meaning rather than as a status.
export const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
}> = ({ children, color = colors.muted, delay = 0 }) => {
  const frame = useFrame();
  return (
    <span
      style={{
        display: 'inline-block',
        border: `2px solid ${color}`,
        borderRadius: 999,
        padding: '5px 18px 6px',
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 2.4,
        textTransform: 'uppercase',
        lineHeight: 1.1,
        color,
        background: colors.panel,
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {children}
    </span>
  );
};

// The scene kicker sits at the same y as in episodes 3 and 4. A scene whose
// subject carries a status says so here, so the label is on screen for every
// beat about that subject rather than for one of them. `tagUntil` is the frame
// the label stops applying: the query scene ends on the list of shipped
// backends, which is not the experimental part and must not be labelled as it.
export const SceneKicker: React.FC<{
  children: React.ReactNode;
  tag?: string;
  tagUntil?: number;
}> = ({ children, tag, tagUntil }) => {
  const frame = useFrame();
  // Removed from the layout rather than faded, or the kicker would sit off
  // centre for the beats the label does not apply to. tagUntil is a beat
  // boundary, which is a hard cut anyway.
  const showTag = Boolean(tag) && (tagUntil === undefined || frame < tagUntil);
  return (
    <div
      style={{
        position: 'absolute',
        top: 62,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <Kicker color={colors.muted}>{children}</Kicker>
      {showTag ? (
        <div style={{ marginBottom: 34 }}>
          <Tag delay={10}>{tag}</Tag>
        </div>
      ) : null}
    </div>
  );
};

// The line that opens a beat, on the series in-scene tier of the shared type
// scale. Sub-lines under it stay Caption.
export const Lead: React.FC<{
  children: string;
  delay?: number;
  maxWidth?: number;
}> = ({ children, delay = 0, maxWidth = 1500 }) => (
  <Headline
    groups={[children]}
    delay={delay}
    size={type.headlineSm.size}
    leading={type.headlineSm.leading}
    maxWidth={maxWidth}
  />
);

// Two named blocks side by side. Used for the pair of failure modes in the
// validate scene and for the pair of query-DSL limits.
//
// `code` exists because Inter draws a lowercase l the same as an uppercase I,
// so the operator names read as "It, le" in the sans face. Operators go on
// their own mono line; the sentence under them stays sans.
export const NoteCard: React.FC<{
  name: string;
  text: string;
  delay: number;
  slide: number;
  code?: string;
  color?: string;
  width?: number;
}> = ({ name, text, delay, slide, code, color = brand.graph, width = 690 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 20,
        padding: '30px 34px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 18),
        transform: `translateX(${slide}px)`,
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 700, color, marginBottom: 12 }}>{name}</div>
      {code ? (
        <div
          style={{
            fontFamily: fonts.mono,
            fontVariantLigatures: 'none',
            fontSize: 27,
            fontWeight: 600,
            color: colors.ink,
            marginBottom: 10,
            whiteSpace: 'pre',
          }}
        >
          {code}
        </div>
      ) : null}
      <div style={{ fontSize: 27, lineHeight: 1.45, color: colors.ink }}>{text}</div>
    </div>
  );
};

// A three-column table on the shared card. Column one is mono, because in both
// tables that use it the cell is an identifier.
export const Table: React.FC<{
  head: string[];
  rows: string[][];
  cols: number[];
  firstMono?: boolean;
  colorOf?: (row: string[], col: number) => string;
  fontSize?: number;
}> = ({ head, rows, cols, firstMono = true, colorOf, fontSize = 25 }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 18,
        padding: '26px 34px',
        textAlign: 'left',
        opacity: fadeIn(frame, 10, 16),
      }}
    >
      <div style={{ display: 'flex', paddingBottom: 14 }}>
        {head.map((h, i) => (
          <div
            key={`${h}-${i}`}
            style={{
              width: cols[i],
              fontSize: 23,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {h}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div
          key={row[0]}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            borderTop: `2px solid ${colors.hairline}`,
            padding: '15px 0',
            opacity: fadeIn(frame, 24 + ri * 11, 16),
          }}
        >
          {row.map((cell, ci) => (
            <div
              key={`${cell}-${ci}`}
              style={{
                width: cols[ci],
                paddingRight: 18,
                fontFamily: firstMono && ci === 0 ? fonts.mono : fonts.sans,
                fontVariantLigatures: 'none',
                fontSize,
                fontWeight: ci === 0 ? 600 : 400,
                color: colorOf ? colorOf(row, ci) : colors.ink,
              }}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
