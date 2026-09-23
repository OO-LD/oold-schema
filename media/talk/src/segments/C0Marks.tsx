import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame, TierBadge } from '../components/Chrome';
import { Row } from '../components/Parts';
import { Headline } from '../components/Type';
import { colors } from '../theme';
import { marks } from '../copy';
import { enterUp, fadeIn } from '../lib/motion';
import type { Tier } from '../timeline';

const Mark: React.FC<{ tier: Tier; body: string; delay: number }> = ({ tier, body, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 500,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 20,
        padding: '38px 36px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 20),
      }}
    >
      <div style={{ display: 'flex' }}>
        <TierBadge tier={tier} />
      </div>
      <div
        style={{
          fontSize: 28,
          lineHeight: 1.44,
          color: colors.ink,
          marginTop: 26,
          ...enterUp(frame, delay + 14, 20, 14),
        }}
      >
        {body}
      </div>
    </div>
  );
};

const Marks: React.FC = () => (
  <Row gap={36} align="stretch">
    {marks.cards.map((m, i) => (
      <Mark key={m.tier} tier={m.tier} body={m.body} delay={i * 16} />
    ))}
  </Row>
);

const Both: React.FC = () => <Headline groups={marks.both} size={58} maxWidth={1480} />;

export const C0Marks: React.FC = () => (
  <SegmentFrame id="C0" kicker={marks.kicker}>
    <Marks />
    <Both />
  </SegmentFrame>
);
