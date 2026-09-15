import React from 'react';
import { brand, colors, fonts, type } from '../../../shared/theme';

// The shared CodeBlock tokenises JSON: it colours quoted keys and leaves the
// rest near-white, which is unreadable for Python, where almost nothing is a
// quoted key. These blocks keep the shared card exactly (panel, hairline
// border, radius, shadow, mono face, code type scale) and only change how a
// line is split into tokens.
//
// Every colour is read off the shared theme inside a render, never captured at
// module scope: applyTheme mutates the palette in place, so a captured value
// would freeze the light hue into a dark render.

const KEYWORDS = new Set([
  'from',
  'import',
  'as',
  'class',
  'def',
  'return',
  'for',
  'in',
  'if',
  'else',
  'not',
  'and',
  'or',
  'with',
  'try',
  'except',
  'while',
  'print',
  'isinstance',
  'None',
  'True',
  'False',
]);

// Names that belong to oold itself, highlighted in the code green the series
// gives to code and codegen, so the library's surface is visible at a glance.
// Amber stays reserved for OO-LD documents: the logo mark and the file-name
// pills of episodes 3 and 4.
//
// Submodule names (backend, model, validation, ...) are deliberately absent:
// they also read as keyword arguments (`backend=store`), so highlighting them
// would paint an argument name as API.
const API = new Set([
  'oold',
  'LinkedBaseModel',
  'Link',
  'LinkList',
  'LinkResultList',
  'LinkNotResolved',
  'OoldField',
  'link_iris',
  'Generator',
  'GenerateParams',
  'SimpleDictDocumentStore',
  'SqliteDocumentStore',
  'LocalSparqlBackend',
  'LocalSparqlResolver',
  'SparqlResolver',
  'WikiDataSparqlResolver',
  'SetResolverParam',
  'SetBackendParam',
  'StoreParam',
  'ResolveParam',
  'set_resolver',
  'set_backend',
  'to_jsonld',
  'to_json',
  'from_json',
  'store_jsonld',
  'resolve_iris',
  'store_json_dicts',
  'export_jsonld',
  'validate_schema',
  'validate_instance',
  'Options',
  'generate',
]);

const WORD_START = /[A-Za-z_]/;
const WORD = /[A-Za-z0-9_]/;

type Tok = { text: string; color: string; weight: number };

const scan = (line: string, stringColor: string): Tok[] => {
  const out: Tok[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    if (ch === '#') {
      out.push({ text: line.slice(i), color: colors.muted, weight: 400 });
      break;
    }

    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j += 1;
      out.push({ text: line.slice(i, j + 1), color: stringColor, weight: 400 });
      i = j + 1;
      continue;
    }

    if (WORD_START.test(ch)) {
      let j = i;
      while (j < line.length && WORD.test(line[j])) j += 1;
      const word = line.slice(i, j);
      if (API.has(word)) out.push({ text: word, color: brand.code, weight: 600 });
      else if (KEYWORDS.has(word)) out.push({ text: word, color: colors.muted, weight: 600 });
      else out.push({ text: word, color: colors.ink, weight: 400 });
      i = j;
      continue;
    }

    let j = i;
    while (j < line.length && !WORD_START.test(line[j]) && !'"\'#'.includes(line[j])) j += 1;
    out.push({ text: line.slice(i, j), color: colors.muted, weight: 400 });
    i = j;
  }
  return out;
};

// JetBrains Mono ligates "--" into one long stroke, which would read as a dash
// rather than as two characters of a CLI flag. Every mono surface here turns
// ligatures off so what is on screen is what you would type.
export const monoBase = {
  fontFamily: fonts.mono,
  lineHeight: type.code.leading,
  fontVariantLigatures: 'none' as const,
};

// The shadow is the literal the shared CodeBlock uses (shared/components/
// CodeBlock.tsx:69) rather than colors.shadow, so the two card kinds sit at the
// same depth in the codegen scene, which shows one of each. Reading the theme
// here would give this card the dark palette's much heavier shadow while the
// shared card kept the light one.
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: colors.panel,
      border: `2px solid ${colors.hairline}`,
      borderRadius: 18,
      padding: '34px 42px',
      textAlign: 'left',
      boxShadow: '0 18px 48px rgba(16,16,16,0.06)',
      ...style,
    }}
  >
    {children}
  </div>
);

type BlockProps = {
  code: string;
  fontSize?: number;
  reveal?: number;
  /** Lines that sit inside a multi-line string literal, drawn as one string. */
  quoteLines?: number[];
  /** Lines belonging to an @context block, drawn in the JSON-LD purple. */
  contextLines?: number[];
};

export const PyBlock: React.FC<BlockProps> = ({
  code,
  fontSize = type.code.size,
  reveal = 1,
  quoteLines = [],
  contextLines = [],
}) => {
  const lines = code.split('\n');
  const shown = reveal * lines.length;

  return (
    <Card>
      <div style={{ ...monoBase, fontSize }}>
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const local = Math.max(0, Math.min(1, shown - idx));
          // String literals take the same neutral the shared CodeBlock gives
          // JSON string values, so a quoted value never competes with an
          // identifier.
          const stringColor = contextLines.includes(lineNo) ? brand.graph : colors.codeString;
          const toks: Tok[] = quoteLines.includes(lineNo)
            ? [{ text: line, color: stringColor, weight: 400 }]
            : scan(line, stringColor);
          return (
            <div
              key={lineNo}
              style={{
                whiteSpace: 'pre',
                minHeight: fontSize * type.code.leading,
                opacity: local,
                transform: `translateX(${(1 - local) * 14}px)`,
              }}
            >
              {toks.map((t, ti) => (
                <span key={ti} style={{ color: t.color, fontWeight: t.weight }}>
                  {t.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const SHELL_CMD = new Set(['uv', 'uvx', 'pip', 'python', 'oold', 'oold-validate']);

// A quoted argument is one token, however many spaces it holds, so
// "import oold; print(oold.__version__)" stays a single run.
const scanShell = (line: string): Tok[] => {
  const out: Tok[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === ' ') {
      out.push({ text: ' ', color: colors.ink, weight: 400 });
      i += 1;
      continue;
    }
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') j += 1;
      out.push({ text: line.slice(i, j + 1), color: colors.codeString, weight: 400 });
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < line.length && line[j] !== ' ' && line[j] !== '"') j += 1;
    const text = line.slice(i, j);
    if (SHELL_CMD.has(text)) out.push({ text, color: brand.code, weight: 600 });
    else if (text.startsWith('-')) out.push({ text, color: colors.muted, weight: 400 });
    else out.push({ text, color: colors.ink, weight: 400 });
    i = j;
  }
  return out;
};

export const ShellBlock: React.FC<BlockProps> = ({
  code,
  fontSize = type.code.size,
  reveal = 1,
}) => {
  const lines = code.split('\n');
  const shown = reveal * lines.length;

  return (
    <Card>
      <div style={{ ...monoBase, fontSize }}>
        {lines.map((line, idx) => {
          const local = Math.max(0, Math.min(1, shown - idx));
          return (
            <div
              key={idx}
              style={{
                whiteSpace: 'pre',
                minHeight: fontSize * type.code.leading,
                opacity: local,
                transform: `translateX(${(1 - local) * 14}px)`,
              }}
            >
              {line.length ? (
                <span style={{ color: colors.muted, fontWeight: 600 }}>{'$ '}</span>
              ) : null}
              {scanShell(line).map((t, ti) => (
                <span key={ti} style={{ color: t.color, fontWeight: t.weight }}>
                  {t.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
