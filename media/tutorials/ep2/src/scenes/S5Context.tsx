import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { IconGraph } from '../../../shared/components/Icons';
import { colors, fonts, OVERLAP, type } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import { copy, minimalContextLines, minimalSchema } from '../copy';
import { sceneById } from '../timeline';
import { Bullet, FileView, Spacer, TopKicker, only } from './parts';

const scene = sceneById('S5');
const A = 170;
const B = 250;
const C = scene.duration - A - B;

const groupOf = only(minimalContextLines, 'context');
const allContext = () => 'context' as const;

const BeatFile: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FileView
        code={minimalSchema}
        groupOf={groupOf}
        wash={{ context: progress(frame, 10, 22) }}
        focus={minimalContextLines}
        scrim={progress(frame, 10, 22) * 0.66}
      />
      <Spacer h={36} />
      <Caption delay={40} size={34} color={colors.ink} maxWidth={1300}>
        {copy.context.lead}
      </Caption>
    </>
  );
};

const Half: React.FC<{ title: string; fragment: string; note: string; delay: number }> = ({
  title,
  fragment,
  note,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 640,
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 18),
      }}
    >
      <div
        style={{
          fontSize: type.label.size,
          fontWeight: type.label.weight,
          letterSpacing: type.label.tracking,
          textTransform: 'uppercase',
          color: colors.context,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <FileView code={fragment} groupOf={allContext} wash={{ context: 1 }} fontSize={26} />
      <div style={{ fontSize: 27, color: colors.muted, marginTop: 14 }}>{note}</div>
    </div>
  );
};

const Arrow: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useFrame();
  const draw = progress(frame, delay, 16);
  return (
    <svg width={74} height={26} viewBox="0 0 74 26" style={{ opacity: fadeIn(frame, delay, 12) }}>
      <path
        d="M 4 13 L 60 13"
        stroke={colors.context}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d="M 50 5 L 60 13 L 50 21"
        stroke={colors.context}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={draw}
      />
    </svg>
  );
};

const Token: React.FC<{ text: string; delay: number; strong?: boolean }> = ({
  text,
  delay,
  strong = false,
}) => {
  const frame = useFrame();
  return (
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 28,
        color: strong ? colors.context : colors.ink,
        fontWeight: strong ? 600 : 400,
        background: strong ? colors.context_wash : colors.panel,
        border: `2px solid ${strong ? colors.context + '44' : colors.hairline}`,
        borderRadius: 10,
        padding: '11px 19px',
        whiteSpace: 'pre',
        opacity: fadeIn(frame, delay, 14),
      }}
    >
      {text}
    </span>
  );
};

const BeatParts: React.FC = () => {
  const frame = useFrame();
  const [term, curie, iri] = copy.context.expansion;
  return (
    <>
      <div style={{ display: 'flex', gap: 48, justifyContent: 'center' }}>
        <Half
          title={copy.context.prefix.title}
          fragment={copy.context.prefix.fragment}
          note={copy.context.prefix.note}
          delay={6}
        />
        <Half
          title={copy.context.term.title}
          fragment={copy.context.term.fragment}
          note={copy.context.term.note}
          delay={26}
        />
      </div>

      <Spacer h={54} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Token text={term} delay={70} />
        <Arrow delay={84} />
        <Token text={curie} delay={98} />
        <Arrow delay={112} />
        <Token text={iri} delay={126} strong />
      </div>
      <Spacer h={26} />
      <div style={{ fontSize: 28, color: colors.muted, opacity: fadeIn(frame, 146, 18) }}>
        {copy.context.expansionNote}
      </div>
    </>
  );
};

const BeatRoles: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <IconGraph size={96} style={{ opacity: fadeIn(frame, 0, 16) }} />
      <Spacer h={26} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {copy.context.roles.map((r, i) => (
          <Bullet key={r} delay={14 + i * 30} color={colors.context} width={1280} size={31}>
            {r}
          </Bullet>
        ))}
      </div>
      <Spacer h={40} />
      <Caption delay={122} size={29} color={colors.muted} maxWidth={1280}>
        {copy.context.remote}
      </Caption>
    </>
  );
};

export const S5Context: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <TopKicker color={colors.context}>{copy.context.kicker}</TopKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFile />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatParts />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatRoles />
      </Sequence>
    </Stage>
  );
};
