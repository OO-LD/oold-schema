import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Chip, Gap, Note, Punch, Row } from '../components/Parts';
import { IconDoc } from '../components/Icons';
import { colors, fonts } from '../theme';
import { wall } from '../copy';
import { enterUp, fadeIn } from '../lib/motion';

// A form, drawn rather than described, because the argument of this segment is
// about what a screen full of required fields feels like and a list of words
// does not carry that.
const FormCard: React.FC = () => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 1080,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderRadius: 18,
        padding: '24px 34px 26px',
        textAlign: 'left',
        opacity: fadeIn(frame, 0, 18),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingBottom: 14,
          borderBottom: `2px solid ${colors.hairline}`,
        }}
      >
        <IconDoc size={42} />
        <div style={{ fontSize: 27, fontWeight: 700, color: colors.ink }}>{wall.formTitle}</div>
      </div>
      {wall.fields.map((f, i) => (
        <div
          key={f.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            paddingTop: 11,
            paddingBottom: 11,
            borderBottom: i === wall.fields.length - 1 ? 'none' : `1px solid ${colors.hairline}`,
            opacity: fadeIn(frame, 10 + i * 7, 14),
          }}
        >
          <div style={{ fontSize: 24, color: colors.ink }}>{f.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 300,
                height: 32,
                borderRadius: 8,
                border: `2px solid ${colors.hairline}`,
                background: colors.bg,
              }}
            />
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 19,
                color: colors.muted,
                width: 170,
              }}
            >
              {f.note}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Form: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <FormCard />
      <Gap h={24} />
      <div
        style={{
          fontSize: 29,
          color: colors.muted,
          maxWidth: 1200,
          ...enterUp(frame, 96, 22, 16),
        }}
      >
        {wall.formCaption}
      </div>
    </>
  );
};

const Inputs: React.FC = () => (
  <>
    <Row gap={26} wrap>
      {wall.inputs.map((t, i) => (
        <Chip key={t} delay={i * 16} size={33}>
          {t}
        </Chip>
      ))}
    </Row>
    <Gap h={54} />
    <Note delay={70} maxWidth={1200}>
      {wall.inputsCaption}
    </Note>
  </>
);

const PunchBeat: React.FC = () => <Punch text={wall.punch} maxWidth={1500} />;

export const C2Form: React.FC = () => (
  <SegmentFrame id="C2" kicker={wall.kicker}>
    <Form />
    <Inputs />
    <PunchBeat />
  </SegmentFrame>
);
