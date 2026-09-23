import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Gap } from '../components/Parts';
import { IconOOLD } from '../components/Icons';
import { brand, colors } from '../theme';
import { close } from '../copy';
import { enterUp, pop } from '../lib/motion';

const Mark: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 2, 14);
  return (
    <>
      <IconOOLD
        size={172}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <Gap h={14} />
      <div
        style={{
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: -1.4,
          color: colors.ink,
          ...enterUp(frame, 16, 24, 22),
        }}
      >
        {close.line}
      </div>
      <Gap h={12} />
      <div style={{ fontSize: 38, color: colors.muted, ...enterUp(frame, 34, 22, 18) }}>
        {close.lineSub}
      </div>
      <Gap h={44} />
      <div
        style={{
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: -1,
          color: brand.oold,
          ...enterUp(frame, 52, 22, 18),
        }}
      >
        {close.site}
      </div>
      <Gap h={10} />
      <div style={{ fontSize: 32, color: colors.muted, ...enterUp(frame, 64, 22, 16) }}>
        {close.repo}
      </div>
    </>
  );
};

const Licence: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div style={{ fontSize: 42, fontWeight: 600, color: colors.ink, ...enterUp(frame, 0, 22, 20) }}>
        {close.licence}
      </div>
      <Gap h={26} />
      <div
        style={{
          fontSize: 28,
          color: colors.muted,
          maxWidth: 1200,
          ...enterUp(frame, 20, 22, 16),
        }}
      >
        {close.funding}
      </div>
    </>
  );
};

export const C12Close: React.FC = () => (
  <SegmentFrame id="C12">
    <Mark />
    <Licence />
  </SegmentFrame>
);
