import React from 'react';
import { Sequence, useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Headline, Kicker, Rule } from '../../../shared/components/Type';
import { IconOOLD } from '../../../shared/components/Icons';
import { colors, fonts, OVERLAP, type } from '../../../shared/theme';
import { enterUp, fadeIn, pop, sceneOpacity } from '../../../shared/lib/motion';
import { Lead, SceneKicker } from '../components/Parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S8');
const A = 380;
const B = scene.duration - A;

const BeatSeries: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <Lead delay={0} maxWidth={1200}>
        {copy.close.seriesLead}
      </Lead>
      <div style={{ height: 30 }} />
      <div style={{ textAlign: 'left' }}>
        {copy.close.series.map((line, i) => (
          <div
            key={line}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              marginBottom: 14,
              ...enterUp(frame, 12 + i * 14, 20, 20),
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                border: `2px solid ${colors.hairline}`,
                background: colors.panel,
                color: i === 4 ? colors.oold_ink : colors.muted,
                fontFamily: fonts.mono,
                fontSize: 27,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: i === 4 ? 700 : 400,
                color: i === 4 ? colors.ink : colors.muted,
              }}
            >
              {line}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 34 }} />
      <Caption delay={110} size={31} color={colors.ink} maxWidth={1400}>
        {copy.close.tie}
      </Caption>
    </>
  );
};

const BeatNext: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 15);

  return (
    <>
      <IconOOLD
        size={104}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div style={{ height: 24 }} />
      <Kicker delay={14} color={colors.oold_ink}>
        {copy.close.nextKicker}
      </Kicker>
      <Headline groups={copy.close.next} delay={26} size={type.headline.size} maxWidth={1400} />
      <div style={{ height: 34 }} />
      <div style={{ textAlign: 'left' }}>
        {copy.close.links.map((l, i) => (
          <div
            key={l.url}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginBottom: 12,
              ...enterUp(frame, 44 + i * 12, 20, 18),
            }}
          >
            <div style={{ width: 300, fontSize: 27, color: colors.muted }}>{l.label}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 29, color: colors.ink }}>{l.url}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 36 }} />
      <div style={{ opacity: fadeIn(frame, 100, 18) }}>
        <Rule delay={100} width={240} color={colors.oold} />
      </div>
      <div style={{ height: 24 }} />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 36,
          fontWeight: 600,
          color: colors.oold_ink,
          ...enterUp(frame, 112, 20, 18),
        }}
      >
        {copy.close.sign}
      </div>
    </>
  );
};

export const S8Close: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.close.kicker}</SceneKicker>

      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatSeries />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatNext />
      </Sequence>
    </Stage>
  );
};
