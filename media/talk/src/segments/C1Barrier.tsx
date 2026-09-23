import React from 'react';
import { SegmentFrame } from '../components/Chrome';
import { Chip, Gap, Note, Punch, Row } from '../components/Parts';
import { Headline } from '../components/Type';
import { barrier } from '../copy';

const Paradox: React.FC = () => <Headline groups={barrier.paradox} size={70} maxWidth={1560} />;

const Cost: React.FC = () => (
  <>
    <Row gap={22} wrap>
      {barrier.cost.map((t, i) => (
        <Chip key={t} delay={i * 14} size={34}>
          {t}
        </Chip>
      ))}
    </Row>
    <Gap h={54} />
    <Note delay={70} maxWidth={1320}>
      {barrier.costCaption}
    </Note>
  </>
);

const PunchBeat: React.FC = () => (
  <Punch text={barrier.punch} sub={barrier.punchSub} maxWidth={1440} />
);

export const C1Barrier: React.FC = () => (
  <SegmentFrame id="C1" kicker={barrier.kicker}>
    <Paradox />
    <Cost />
    <PunchBeat />
  </SegmentFrame>
);
