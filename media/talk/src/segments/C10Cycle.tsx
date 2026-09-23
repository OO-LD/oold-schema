import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Arrow, Gap, Note, Punch } from '../components/Parts';
import { colors } from '../theme';
import { cycle } from '../copy';
import { fadeIn, progress } from '../lib/motion';

// Three stations with the return leg drawn underneath, rather than a ring. A
// ring puts one of the three labels upside down at this width, and the return
// leg is the part the picture is about.
const Loop: React.FC = () => {
  const frame = useFrame();
  const back = progress(frame, 88, 46);
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {cycle.loop.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 ? <Arrow delay={12 + i * 20} width={70} /> : null}
            <div
              style={{
                width: 372,
                minHeight: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '22px 26px',
                background: colors.panel,
                border: `2px solid ${colors.hairline}`,
                borderRadius: 16,
                fontSize: 30,
                lineHeight: 1.3,
                color: colors.ink,
                opacity: fadeIn(frame, i * 20, 18),
              }}
            >
              {label}
            </div>
          </React.Fragment>
        ))}
      </div>
      <svg width={1300} height={120} viewBox="0 0 1300 120" style={{ marginTop: -6 }}>
        <path
          d="M 1140 6 L 1140 74 Q 1140 96 1112 96 L 188 96 Q 160 96 160 74 L 160 20"
          stroke={colors.oold_ink}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - back}
        />
        <path
          d="M 150 32 L 160 16 L 170 32"
          stroke={colors.oold_ink}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={back > 0.96 ? 1 : 0}
        />
      </svg>
      <Gap h={24} />
      <Note delay={148} maxWidth={1340}>
        {cycle.loopCaption}
      </Note>
    </>
  );
};

const PunchBeat: React.FC = () => (
  <Punch text={cycle.punch} sub={cycle.punchSub} maxWidth={1460} />
);

export const C10Cycle: React.FC = () => (
  <SegmentFrame id="C10" kicker={cycle.kicker}>
    <Loop />
    <PunchBeat />
  </SegmentFrame>
);
