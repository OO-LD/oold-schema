import React from 'react';
import { colors, fonts, type, brand } from '../theme';

type Kind = 'key' | 'string' | 'punct';
type Token = { text: string; kind: Kind };

const tokenize = (line: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') j += 1;
      const text = line.slice(i, j + 1);
      let k = j + 1;
      while (k < line.length && line[k] === ' ') k += 1;
      tokens.push({ text, kind: line[k] === ':' ? 'key' : 'string' });
      i = j + 1;
    } else {
      let j = i;
      while (j < line.length && line[j] !== '"') j += 1;
      tokens.push({ text: line.slice(i, j), kind: 'punct' });
      i = j;
    }
  }
  return tokens;
};

export type Group = 'context' | 'schema' | 'plain';

// Functions, not constants: the palette object is swapped by applyTheme after
// this module is imported, so a table built at module scope would freeze the
// light colours and the dark render would come out half light.
const groupColor = (g: Group): string =>
  g === 'context' ? colors.context : g === 'schema' ? colors.schema : colors.codePlain;

const groupWash = (g: Group): string =>
  g === 'context' ? colors.context_wash : g === 'schema' ? colors.schema_wash : 'transparent';

export type CodeBlockProps = {
  code: string;
  groupOf: (lineNo: number) => Group;
  reveal?: number;
  wash?: Partial<Record<Group, number>>;
  fontSize?: number;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  groupOf,
  reveal = 1,
  wash = {},
  fontSize = type.code.size,
}) => {
  const lines = code.split('\n');
  const shown = reveal * lines.length;

  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize,
        lineHeight: type.code.leading,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 18,
        padding: '34px 42px',
        textAlign: 'left',
        boxShadow: '0 18px 48px rgba(16,16,16,0.06)',
      }}
    >
      {lines.map((line, idx) => {
        const lineNo = idx + 1;
        const group = groupOf(lineNo);
        const local = Math.max(0, Math.min(1, shown - idx));
        const washAmount = wash[group] ?? 0;
        return (
          <div
            key={lineNo}
            style={{
              position: 'relative',
              opacity: local,
              transform: `translateX(${(1 - local) * 14}px)`,
              whiteSpace: 'pre',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-2px -14px',
                borderRadius: 6,
                background: groupWash(group),
                opacity: washAmount,
                transform: `scaleX(${washAmount})`,
                transformOrigin: 'left center',
              }}
            />
            <span style={{ position: 'relative' }}>
              {tokenize(line).map((t, ti) => (
                <span
                  key={ti}
                  style={{
                    color:
                      t.kind === 'key'
                        ? groupColor(group)
                        : t.kind === 'string'
                          ? colors.codeString
                          : colors.codePunct,
                    fontWeight: t.kind === 'key' ? 600 : 400,
                  }}
                >
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
};
