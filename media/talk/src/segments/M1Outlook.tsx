import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Row } from '../components/Parts';
import { colors } from '../theme';
import { outlook } from '../copy';
import { fadeIn } from '../lib/motion';

// Names, and nothing else. What either effort is, who is in it and what it will
// contain is the speaker's to say out loud; asserting any of it on a slide would
// be this deck making a claim it cannot support. "upcoming" is the abstract's
// own word for MaterialsCommons4EU and the only label that appears.
const Name: React.FC<{ name: string; note: string; delay: number }> = ({ name, note, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 700,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 20,
        padding: '52px 40px',
        opacity: fadeIn(frame, delay, 20),
      }}
    >
      <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1, color: colors.ink }}>
        {name}
      </div>
      <div
        style={{
          fontSize: 26,
          color: colors.muted,
          marginTop: 16,
          minHeight: 34,
        }}
      >
        {note}
      </div>
    </div>
  );
};

const Outlook: React.FC = () => (
  <Row gap={48} align="stretch">
    {outlook.names.map((n, i) => (
      <Name key={n.name} name={n.name} note={n.note} delay={i * 20} />
    ))}
  </Row>
);

export const M1Outlook: React.FC = () => (
  <SegmentFrame id="M1" kicker={outlook.kicker}>
    <Outlook />
  </SegmentFrame>
);
