import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame, TierBadge } from '../components/Chrome';
import { Gap, Note, Row } from '../components/Parts';
import { colors, fonts } from '../theme';
import { underway } from '../copy';
import { enterUp, fadeIn } from '../lib/motion';

const Project: React.FC<{
  name: string;
  note: string;
  body: string;
  listTitle: string;
  list: string[];
  delay: number;
}> = ({ name, note, body, listTitle, list, delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 700,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 18,
        padding: '30px 34px',
        textAlign: 'left',
        opacity: fadeIn(frame, delay, 18),
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: 32, fontWeight: 600, color: colors.ink }}>
        {name}
      </div>
      <div style={{ fontSize: 22, color: colors.muted, marginTop: 8 }}>{note}</div>
      <div style={{ fontSize: 25, lineHeight: 1.42, color: colors.ink, marginTop: 20 }}>{body}</div>
      <div
        style={{
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.muted,
          marginTop: 24,
          paddingTop: 18,
          borderTop: `2px solid ${colors.hairline}`,
        }}
      >
        {listTitle}
      </div>
      {list.map((item, i) => (
        <div
          key={item}
          style={{
            display: 'flex',
            gap: 14,
            fontSize: 24,
            lineHeight: 1.36,
            color: colors.muted,
            marginTop: 12,
            opacity: fadeIn(frame, delay + 20 + i * 8, 14),
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: colors.oold_ink,
              marginTop: 10,
              flexShrink: 0,
            }}
          />
          <div>{item}</div>
        </div>
      ))}
    </div>
  );
};

const Projects: React.FC = () => (
  <Row gap={48} align="stretch">
    {underway.projects.map((p, i) => (
      <Project
        key={p.name}
        name={p.name}
        note={p.note}
        body={p.body}
        listTitle={p.listTitle}
        list={p.list}
        delay={i * 18}
      />
    ))}
  </Row>
);

const Wording: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.22,
          letterSpacing: -1.1,
          color: colors.ink,
          maxWidth: 1440,
          ...enterUp(frame, 0, 24, 26),
        }}
      >
        {underway.wording}
      </div>
      <Gap h={34} />
      <Note delay={24} maxWidth={1400}>
        {underway.wordingSub}
      </Note>
    </>
  );
};

// The payoff of the three marks: the same architecture split into the three
// kinds of claim it is actually made of, in the order they harden.
const Arc: React.FC = () => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      {underway.arc.map((step, i) => (
        <div
          key={step.tier}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 34,
            opacity: fadeIn(frame, i * 20, 18),
          }}
        >
          <div style={{ width: 280, display: 'flex', justifyContent: 'flex-end' }}>
            <TierBadge tier={step.tier} size={28} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, color: colors.ink, textAlign: 'left' }}>
            {step.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export const C6Underway: React.FC = () => (
  <SegmentFrame id="C6" kicker={underway.kicker}>
    <Projects />
    <Wording />
    <Arc />
  </SegmentFrame>
);
