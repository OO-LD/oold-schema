import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Cite, SegmentFrame } from '../components/Chrome';
import { Arrow, Gap, Punch, Row } from '../components/Parts';
import { IconOOLD } from '../components/Icons';
import { colors } from '../theme';
import { doors } from '../copy';
import { fadeIn, pop } from '../lib/motion';

const Door: React.FC<{ label: string; sub: string; delay: number }> = ({ label, sub, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 470,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 18,
        padding: '32px 34px',
        opacity: fadeIn(frame, delay, 18),
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 700, color: colors.ink }}>{label}</div>
      <div style={{ fontSize: 27, color: colors.muted, marginTop: 14 }}>{sub}</div>
    </div>
  );
};

const Doors: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 0, 15);
  return (
    <>
      <IconOOLD
        size={104}
        style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
      />
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: colors.ink,
          opacity: fadeIn(frame, 12, 16),
        }}
      >
        {doors.source}
      </div>
      <Gap h={10} />
      <Arrow delay={26} vertical width={62} />
      <Gap h={10} />
      <Row gap={54} align="stretch">
        <Door label={doors.doors[0].label} sub={doors.doors[0].sub} delay={44} />
        <Door label={doors.doors[1].label} sub={doors.doors[1].sub} delay={60} />
      </Row>
      <Gap h={40} />
      <Cite delay={86}>{doors.doorsCite}</Cite>
    </>
  );
};

const Same: React.FC = () => <Punch text={doors.same} sub={doors.sameSub} maxWidth={1440} />;

const PunchBeat: React.FC = () => <Punch text={doors.punch} maxWidth={1440} size={70} />;

export const C9Doors: React.FC = () => (
  <SegmentFrame id="C9" kicker={doors.kicker}>
    <Doors />
    <Same />
    <PunchBeat />
  </SegmentFrame>
);
