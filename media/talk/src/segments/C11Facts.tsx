import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Gap, Note } from '../components/Parts';
import { IconOOLD } from '../components/Icons';
import { brand, colors, fonts } from '../theme';
import { facts } from '../copy';
import { enterUp, fadeIn, pop } from '../lib/motion';

// Six present-tense statements, each of which resolves to something in the
// repository. Nothing here is a number the talk made up, which is the reason the
// segment can carry the filled mark.
const Facts: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 480px)',
        gap: 34,
      }}
    >
      {facts.items.map((item, i) => {
        const s = pop(frame, fps, i * 12, 15);
        return (
          <div
            key={item}
            style={{
              background: colors.panel,
              border: `2px solid ${colors.hairline}`,
              borderLeft: `6px solid ${brand.oold}`,
              borderRadius: 16,
              padding: '30px 30px',
              textAlign: 'left',
              fontSize: 29,
              lineHeight: 1.36,
              fontWeight: 600,
              color: colors.ink,
              opacity: fadeIn(frame, i * 12, 16),
              transform: `translateY(${(1 - s) * 20}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

const Funding: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <IconOOLD size={104} style={{ opacity: fadeIn(frame, 0, 20) }} />
      <Gap h={36} />
      <div
        style={{
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.36,
          color: colors.ink,
          maxWidth: 1420,
          ...enterUp(frame, 16, 24, 22),
        }}
      >
        {facts.funding}
      </div>
    </>
  );
};

const Check: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.26,
          letterSpacing: -0.8,
          color: colors.ink,
          maxWidth: 1400,
          ...enterUp(frame, 0, 24, 22),
        }}
      >
        {facts.checkTitle}
      </div>
      <Gap h={40} />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 32,
          color: colors.ink,
          background: colors.panel,
          border: `2px solid ${colors.hairline}`,
          borderRadius: 14,
          padding: '20px 32px',
          opacity: fadeIn(frame, 26, 18),
        }}
      >
        {facts.checkCommand}
      </div>
      <Gap h={40} />
      <Note delay={50} size={38} color={brand.oold}>
        {facts.checkSite}
      </Note>
    </>
  );
};

export const C11Facts: React.FC = () => (
  <SegmentFrame id="C11" kicker={facts.kicker}>
    <Facts />
    <Funding />
    <Check />
  </SegmentFrame>
);
