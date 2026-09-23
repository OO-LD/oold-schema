import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Gap } from '../components/Parts';
import { IconOOLD } from '../components/Icons';
import { brand, colors } from '../theme';
import { close, facts, mse } from '../copy';
import { enterUp, fadeIn } from '../lib/motion';

const Thanks: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <IconOOLD size={118} style={{ opacity: fadeIn(frame, 0, 20) }} />
      <Gap h={18} />
      <div
        style={{
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: -2,
          color: colors.ink,
          ...enterUp(frame, 12, 24, 24),
        }}
      >
        {mse.thanks}
      </div>
      <Gap h={32} />
      <div style={{ fontSize: 36, fontWeight: 600, ...enterUp(frame, 32, 22, 18) }}>
        {mse.speaker}
      </div>
      <Gap h={10} />
      <div style={{ fontSize: 28, color: colors.muted, ...enterUp(frame, 42, 22, 16) }}>
        {mse.affiliation}
      </div>
      <Gap h={34} />
      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: brand.oold,
          ...enterUp(frame, 54, 22, 18),
        }}
      >
        {close.site}
      </div>
      <Gap h={38} />
      <div
        style={{
          fontSize: 25,
          color: colors.muted,
          maxWidth: 1180,
          lineHeight: 1.45,
          ...enterUp(frame, 68, 22, 16),
        }}
      >
        {facts.funding}
      </div>
    </>
  );
};

export const M2Thanks: React.FC = () => (
  <SegmentFrame id="M2">
    <Thanks />
  </SegmentFrame>
);
