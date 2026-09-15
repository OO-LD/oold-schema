import React from 'react';
import { brand } from '../theme';

const BOX = 200;

export type IconProps = {
  size?: number;
  color?: string;
  braces?: boolean;
  style?: React.CSSProperties;
};

// Symbols stay inside x 58..142 / y 40..160 so they never touch the brace nubs.
const LEFT_BRACE =
  'M 64 20 L 52 20 Q 38 20 38 34 L 38 84 Q 38 96 24 100 Q 38 104 38 116 L 38 166 Q 38 180 52 180 L 64 180';

const Braces: React.FC<{ color: string }> = ({ color }) => (
  <g stroke={color} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d={LEFT_BRACE} />
    <path d={LEFT_BRACE} transform={`translate(${BOX} 0) scale(-1 1)`} />
  </g>
);

const Frame: React.FC<IconProps & { children: React.ReactNode; color: string }> = ({
  size = 200,
  color,
  braces = true,
  style,
  children,
}) => (
  <svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`} style={style}>
    {braces ? <Braces color={color} /> : null}
    {children}
  </svg>
);

export const IconOOLD: React.FC<IconProps> = (p) => {
  const color = p.color ?? brand.oold;
  return (
    <Frame {...p} color={color}>
      <g stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx={77} cy={66} r={15} />
        <circle cx={123} cy={66} r={15} />
        <path d="M 66 106 L 66 150 L 90 150" />
        <path d="M 110 106 L 120 106 C 134 106 140 116 140 128 C 140 140 134 150 120 150 L 110 150 L 110 106" />
      </g>
    </Frame>
  );
};

export const IconValidate: React.FC<IconProps> = (p) => {
  const color = p.color ?? brand.validate;
  return (
    <Frame {...p} color={color}>
      <g stroke={color} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 60 60 L 76 78 L 112 38" />
        <path d="M 84 98 L 140 156" />
        <path d="M 140 98 L 84 156" />
      </g>
    </Frame>
  );
};

export const IconCode: React.FC<IconProps> = (p) => {
  const color = p.color ?? brand.code;
  return (
    <Frame {...p} color={color}>
      <g stroke={color} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 82 62 L 58 100 L 82 138" />
        <path d="M 118 62 L 142 100 L 118 138" />
        <path d="M 104 54 L 96 146" strokeWidth={10} />
      </g>
    </Frame>
  );
};

export const IconGraph: React.FC<IconProps> = (p) => {
  const color = p.color ?? brand.graph;
  return (
    <Frame {...p} color={color}>
      <g stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 91 84 L 83 70" />
        <path d="M 109 84 L 117 70" />
        <path d="M 100 115 L 100 129" />
        <circle cx={72} cy={54} r={13} />
        <circle cx={128} cy={54} r={13} />
        <circle cx={100} cy={148} r={13} />
        <circle cx={100} cy={98} r={11} fill={color} />
      </g>
    </Frame>
  );
};

export const IconDoc: React.FC<IconProps> = (p) => {
  const color = p.color ?? brand.doc;
  return (
    <Frame {...p} color={color}>
      <g stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x={62} y={62} width={58} height={94} rx={7} />
        <path d="M 78 96 L 104 96" strokeWidth={10} />
        <path d="M 78 114 L 104 114" strokeWidth={10} />
        <path d="M 78 132 L 104 132" strokeWidth={10} />
      </g>
      <path
        d="M 128 40 C 130.5 56 136 61.5 152 64 C 136 66.5 130.5 72 128 88 C 125.5 72 120 66.5 104 64 C 120 61.5 125.5 56 128 40 Z"
        fill={color}
      />
      <path
        d="M 143 76 C 144.3 84 146 85.7 154 87 C 146 88.3 144.3 90 143 98 C 141.7 90 140 88.3 132 87 C 140 85.7 141.7 84 143 76 Z"
        fill={color}
      />
    </Frame>
  );
};

export const IconStore: React.FC<IconProps> = (p) => {
  const color = p.color ?? brand.store;
  return (
    <Frame {...p} color={color}>
      <g stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <ellipse cx={100} cy={60} rx={38} ry={14} />
        <path d="M 62 60 L 62 140" />
        <path d="M 138 60 L 138 140" />
        <path d="M 62 87 A 38 14 0 0 0 138 87" />
        <path d="M 62 113.5 A 38 14 0 0 0 138 113.5" />
        <path d="M 62 140 A 38 14 0 0 0 138 140" />
      </g>
    </Frame>
  );
};

export type IconKey = 'oold' | 'validate' | 'code' | 'graph' | 'doc' | 'store';

export const icons: Record<IconKey, React.FC<IconProps>> = {
  oold: IconOOLD,
  validate: IconValidate,
  code: IconCode,
  graph: IconGraph,
  doc: IconDoc,
  store: IconStore,
};
