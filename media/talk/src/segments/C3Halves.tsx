import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Gap, Note, Row, StandardPanel } from '../components/Parts';
import { Headline } from '../components/Type';
import { IconGraph, IconValidate } from '../components/Icons';
import { colors } from '../theme';
import { halves } from '../copy';
import { fadeIn, progress } from '../lib/motion';

const Panels: React.FC = () => (
  <Row gap={44} align="stretch">
    <StandardPanel
      color={colors.schema}
      wash={colors.schema_wash}
      Icon={IconValidate}
      label={halves.schema.label}
      sub={halves.schema.sub}
      tokens={halves.schema.tokens}
      delay={0}
    />
    <StandardPanel
      color={colors.context}
      wash={colors.context_wash}
      Icon={IconGraph}
      label={halves.context.label}
      sub={halves.context.sub}
      tokens={halves.context.tokens}
      delay={16}
    />
  </Row>
);

const Neither: React.FC = () => <Headline groups={halves.neither} size={58} maxWidth={1560} />;

// Two files pulling apart. The gap opens over the beat, which is the whole
// point of the picture: they are correct on the day they are generated.
const Drift: React.FC = () => {
  const frame = useFrame();
  const open = progress(frame, 20, 70);
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {halves.drift.map((label, i) => (
          <div
            key={label}
            style={{
              width: 420,
              height: 210,
              margin: '0 18px',
              background: colors.panel,
              border: `2px solid ${colors.hairline}`,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 600,
              color: colors.ink,
              opacity: fadeIn(frame, i * 12, 18),
              transform: `translateX(${(i === 0 ? -1 : 1) * open * 120}px) rotate(${
                (i === 0 ? -1 : 1) * open * 3
              }deg)`,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <Gap h={56} />
      <Note delay={70} maxWidth={1320}>
        {halves.driftCaption}
      </Note>
    </>
  );
};

export const C3Halves: React.FC = () => (
  <SegmentFrame id="C3" kicker={halves.kicker}>
    <Panels />
    <Neither />
    <Drift />
  </SegmentFrame>
);
