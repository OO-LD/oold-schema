import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Gap } from '../components/Parts';
import { IconOOLD } from '../components/Icons';
import { colors, type } from '../theme';
import { mse } from '../copy';
import { enterUp, fadeIn } from '../lib/motion';

// The conference framing, kept in its own segment so the core cut drops it by
// filtering on scope rather than by editing anything.
const Title: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <IconOOLD size={112} style={{ opacity: fadeIn(frame, 0, 20) }} />
      <Gap h={22} />
      <div
        style={{
          fontSize: type.kicker.size,
          fontWeight: type.kicker.weight,
          letterSpacing: type.kicker.tracking,
          textTransform: 'uppercase',
          color: colors.muted,
          ...enterUp(frame, 10, 18, 14),
        }}
      >
        {mse.eyebrow}
      </div>
      <Gap h={30} />
      <div style={{ maxWidth: 1560 }}>
        {mse.title.map((line, i) => (
          <div
            key={line}
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.26,
              letterSpacing: -1,
              color: colors.ink,
              ...enterUp(frame, 24 + i * 14, 24, 24),
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <Gap h={46} />
      <div
        style={{
          width: 240,
          height: 4,
          borderRadius: 2,
          background: colors.hairline,
          opacity: fadeIn(frame, 76, 20),
        }}
      />
      <Gap h={40} />
      <div style={{ fontSize: 40, fontWeight: 600, ...enterUp(frame, 86, 22, 18) }}>
        {mse.speaker}
      </div>
      <Gap h={12} />
      <div style={{ fontSize: 30, color: colors.muted, ...enterUp(frame, 98, 22, 16) }}>
        {mse.affiliation}
      </div>
      <Gap h={26} />
      <div style={{ fontSize: 27, color: colors.muted, ...enterUp(frame, 110, 22, 16) }}>
        {mse.venue}
      </div>
      <div style={{ fontSize: 27, color: colors.muted, ...enterUp(frame, 118, 22, 16) }}>
        {mse.place}
      </div>
    </>
  );
};

export const M0Title: React.FC = () => (
  <SegmentFrame id="M0">
    <Title />
  </SegmentFrame>
);
