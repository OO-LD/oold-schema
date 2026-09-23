import React from 'react';
import { useFrame } from '@rendiv/core';
import { Cite, SegmentFrame } from '../components/Chrome';
import { Card, Gap, Punch, Row } from '../components/Parts';
import { colors } from '../theme';
import { unsure } from '../copy';
import { enterUp } from '../lib/motion';

const Cards: React.FC = () => (
  <Row gap={38} align="stretch">
    {unsure.cards.map((c, i) => (
      <Card key={c.when} title={c.when} body={c.then} delay={i * 16} width={470} />
    ))}
  </Row>
);

// The one beat of this segment that rests on something published rather than on
// the position the rest of it takes. src/timeline.json overrides its tier, so
// the badge changes with it.
const Written: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div
        style={{
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.24,
          letterSpacing: -1,
          color: colors.ink,
          maxWidth: 1440,
          ...enterUp(frame, 0, 24, 26),
        }}
      >
        {unsure.written}
      </div>
      <Gap h={34} />
      <div
        style={{
          fontSize: 31,
          lineHeight: 1.45,
          color: colors.muted,
          maxWidth: 1360,
          ...enterUp(frame, 24, 22, 18),
        }}
      >
        {unsure.writtenSub}
      </div>
      <Gap h={34} />
      <Cite delay={56}>{unsure.writtenCite}</Cite>
    </>
  );
};

const PunchBeat: React.FC = () => <Punch text={unsure.punch} maxWidth={1480} />;

export const C8Unsure: React.FC = () => (
  <SegmentFrame id="C8" kicker={unsure.kicker}>
    <Cards />
    <Written />
    <PunchBeat />
  </SegmentFrame>
);
