import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../components/Stage';
import { Caption, Kicker } from '../components/Type';
import { CodeBlock, Group } from '../components/CodeBlock';
import { IconOOLD, IconValidate, IconGraph, icons } from '../components/Icons';
import { contextLines, copy, minimalSchema, schemaLines } from '../copy';
import { brand, colors, fonts, OVERLAP, sceneById } from '../theme';
import { enterUp, fadeIn, pop, progress, sceneOpacity } from '../lib/motion';

const scene = sceneById('S3');
const A = 250;
const B = 290;
const C = scene.duration - A - B;

const groupOf = (lineNo: number): Group =>
  contextLines.includes(lineNo) ? 'context' : schemaLines.includes(lineNo) ? 'schema' : 'plain';

const SidePanel: React.FC<{
  color: string;
  wash: string;
  Icon: React.FC<{ size?: number }>;
  label: string;
  sub: string;
  tokens: string[];
  delay: number;
  slide: number;
}> = ({ color, wash, Icon, label, sub, tokens, delay, slide }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 560,
        background: wash,
        border: `3px solid ${color}22`,
        borderRadius: 20,
        padding: '32px 36px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 20),
        transform: `translateX(${slide}px)`,
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

const BeatMerge: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const close = progress(frame, 108, 44);
  const mark = pop(frame, fps, 150, 15);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <SidePanel
          color={brand.validate}
          wash={colors.schema_wash}
          Icon={IconValidate}
          label={copy.mechanism.schema.label}
          sub={copy.mechanism.schema.sub}
          tokens={copy.mechanism.schema.tokens}
          delay={16}
          slide={(1 - close) * -150}
        />
        <div style={{ width: 150, display: 'flex', justifyContent: 'center' }}>
          <IconOOLD
            size={150}
            style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
          />
        </div>
        <SidePanel
          color={brand.graph}
          wash={colors.context_wash}
          Icon={IconGraph}
          label={copy.mechanism.context.label}
          sub={copy.mechanism.context.sub}
          tokens={copy.mechanism.context.tokens}
          delay={30}
          slide={(1 - close) * 150}
        />
      </div>

      <div style={{ height: 62 }} />
      <div
        style={{
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: -0.8,
          ...enterUp(frame, 178, 24, 24),
        }}
      >
        {copy.mechanism.union}
      </div>
    </>
  );
};

const BeatCode: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div>
        <CodeBlock
          code={minimalSchema}
          groupOf={groupOf}
          reveal={progress(frame, 6, 120)}
          wash={{
            context: progress(frame, 150, 26),
            schema: progress(frame, 190, 26),
          }}
        />
      </div>
      <div style={{ height: 44 }} />
      <div>
        <Caption delay={236} size={38} color={colors.ink} maxWidth={1500}>
          {copy.mechanism.claim}
        </Caption>
      </div>
    </>
  );
};

const BeatOutputs: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const hub = pop(frame, fps, 6, 15);

  return (
    <>
      <div>
        <Caption delay={0} size={34} color={colors.muted} maxWidth={1200}>
          {copy.mechanism.outputsLead}
        </Caption>
      </div>

      <div style={{ marginTop: 6 }}>
        <IconOOLD
          size={116}
          style={{ transform: `scale(${hub})`, transformOrigin: 'center', opacity: hub }}
        />
      </div>

      {/* SVG is 1400 wide and centred in a 1920 frame, so screen x maps to x - 260.
          Icon centres are 448 / 704 / 960 / 1216 / 1472 (5 x 204 wide, 52 gap). */}
      <svg width={1400} height={92} viewBox="0 0 1400 92">
        {[188, 444, 700, 956, 1212].map((x, i) => {
          const draw = progress(frame, 26 + i * 8, 22);
          return (
            <path
              key={x}
              d={`M 700 0 C 700 46, ${x} 40, ${x} 86`}
              stroke={colors.hairline}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          );
        })}
      </svg>

      <div
        style={{
          display: 'flex',
          gap: 52,
          alignItems: 'flex-start',
          marginTop: -4,
        }}
      >
        {copy.mechanism.outputs.map((o, i) => {
          const Icon = icons[o.icon];
          const s = pop(frame, fps, 48 + i * 9, 15);
          return (
            <div
              key={o.label}
              style={{
                width: 204,
                opacity: fadeIn(frame, 48 + i * 9, 14),
                transform: `translateY(${(1 - s) * 20}px)`,
              }}
            >
              <Icon size={104} />
              <div style={{ fontSize: 25, fontWeight: 600, marginTop: 6 }}>{o.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 52 }} />
      <div>
        <Caption delay={116} size={32} color={colors.muted} maxWidth={1440}>
          {copy.mechanism.source}
        </Caption>
      </div>
    </>
  );
};

export const S3Mechanism: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)} justify="center">
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker color={colors.muted}>{copy.mechanism.kicker}</Kicker>
      </div>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatMerge />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatCode />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatOutputs />
      </Sequence>
    </Stage>
  );
};
