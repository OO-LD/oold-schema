import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Arrow, Gap, Note, Punch } from '../components/Parts';
import { Headline } from '../components/Type';
import { colors } from '../theme';
import { inversion } from '../copy';
import { fadeIn } from '../lib/motion';

const Lane: React.FC<{ label: string; steps: string[]; delay: number; accent: string }> = ({
  label,
  steps,
  delay,
  accent,
}) => {
  const frame = useFrame();
  return (
    <div style={{ opacity: fadeIn(frame, delay, 18) }}>
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: accent,
          textAlign: 'left',
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 ? <Arrow delay={delay + i * 12} width={54} /> : null}
            <div
              style={{
                width: 292,
                minHeight: 104,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 20px',
                background: colors.panel,
                border: `2px solid ${i === steps.length - 1 ? accent : colors.hairline}`,
                borderRadius: 14,
                fontSize: 26,
                lineHeight: 1.3,
                color: colors.ink,
                opacity: fadeIn(frame, delay + i * 12, 16),
              }}
            >
              {s}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const Lanes: React.FC = () => (
  <>
    <Lane
      label={inversion.lanes[0].label}
      steps={inversion.lanes[0].steps}
      delay={0}
      accent={colors.muted}
    />
    <Gap h={42} />
    <Lane
      label={inversion.lanes[1].label}
      steps={inversion.lanes[1].steps}
      delay={64}
      accent={colors.oold_ink}
    />
    <Gap h={46} />
    <Note delay={136} maxWidth={1400}>
      {inversion.lanesCaption}
    </Note>
  </>
);

const Flip: React.FC = () => <Headline groups={inversion.flip} size={58} maxWidth={1580} />;

const PunchBeat: React.FC = () => (
  <Punch text={inversion.punch} sub={inversion.punchSub} maxWidth={1480} />
);

export const C7Inversion: React.FC = () => (
  <SegmentFrame id="C7" kicker={inversion.kicker}>
    <Lanes />
    <Flip />
    <PunchBeat />
  </SegmentFrame>
);
