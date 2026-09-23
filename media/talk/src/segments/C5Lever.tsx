import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Cite, SegmentFrame } from '../components/Chrome';
import { Arrow, Gap, Note, Punch, Row } from '../components/Parts';
import { Headline } from '../components/Type';
import { IconOOLD, icons } from '../components/Icons';
import { colors, fonts } from '../theme';
import { lever } from '../copy';
import { enterUp, fadeIn, pop } from '../lib/motion';

const Contract: React.FC = () => <Headline groups={lever.contract} size={64} maxWidth={1560} />;

const Stack: React.FC<{ items: string[]; delay: number }> = ({ items, delay }) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((t, i) => (
        <div
          key={t}
          style={{
            fontSize: 27,
            color: colors.muted,
            background: colors.panel,
            border: `2px solid ${colors.hairline}`,
            borderRadius: 12,
            padding: '13px 22px',
            whiteSpace: 'nowrap',
            opacity: fadeIn(frame, delay + i * 10, 14),
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
};

const Pipe: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const mark = pop(frame, fps, 36, 15);
  return (
    <>
      <Row gap={30}>
        <Stack items={lever.pipeIn} delay={0} />
        <Arrow delay={30} />
        <div style={{ width: 330 }}>
          <IconOOLD
            size={112}
            style={{ transform: `scale(${mark})`, transformOrigin: 'center', opacity: mark }}
          />
          <div
            style={{
              fontSize: 27,
              fontWeight: 600,
              color: colors.ink,
              marginTop: 4,
              opacity: fadeIn(frame, 42, 16),
            }}
          >
            {lever.pipeModel}
          </div>
        </div>
        <Arrow delay={58} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {lever.pipeOut.map((o, i) => {
            const Icon = icons[o.icon];
            return (
              <div
                key={o.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  opacity: fadeIn(frame, 68 + i * 12, 16),
                }}
              >
                <Icon size={62} />
                <div style={{ fontSize: 28, fontWeight: 600, color: colors.ink }}>{o.label}</div>
              </div>
            );
          })}
        </div>
      </Row>
      <Gap h={52} />
      <Note delay={98} size={32} color={colors.ink} maxWidth={1420}>
        {lever.pipeCaption}
      </Note>
      <Gap h={22} />
      <Note delay={120} size={28} maxWidth={1420}>
        {lever.pipePunch}
      </Note>
    </>
  );
};

// One observed roundtrip, laid out as what went in, what the context said it
// meant, and what came back. It is an observation, not a measurement, and the
// heading says so.
const Roundtrip: React.FC = () => {
  const frame = useFrame();
  const colWidth = [270, 490, 330];
  const cellColor = (i: number) => (i === 1 ? colors.context : colors.ink);
  return (
    <>
      <Note delay={0} size={30} color={colors.ink} maxWidth={1200}>
        {lever.roundtripTitle}
      </Note>
      <Gap h={28} />
      <div
        style={{
          background: colors.panel,
          border: `2px solid ${colors.hairline}`,
          borderRadius: 18,
          padding: '26px 40px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', gap: 40, paddingBottom: 16 }}>
          {lever.roundtripHead.map((h, i) => (
            <div
              key={h}
              style={{
                width: colWidth[i],
                fontSize: 24,
                color: colors.muted,
                opacity: fadeIn(frame, 12 + i * 10, 14),
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {lever.roundtripRows.map((row, r) => (
          <div
            key={row[0]}
            style={{
              display: 'flex',
              gap: 40,
              paddingTop: 16,
              paddingBottom: 16,
              borderTop: `2px solid ${colors.hairline}`,
            }}
          >
            {row.map((cell, i) => (
              <div
                key={cell}
                style={{
                  width: colWidth[i],
                  fontFamily: fonts.mono,
                  fontSize: 29,
                  fontWeight: i === 1 ? 600 : 400,
                  color: cellColor(i),
                  opacity: fadeIn(frame, 44 + r * 16 + i * 12, 14),
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Gap h={28} />
      <div style={{ fontSize: 30, color: colors.ink, ...enterUp(frame, 130, 22, 16) }}>
        {lever.roundtripCaption}
      </div>
      <Gap h={18} />
      <Cite delay={150}>{lever.roundtripCite}</Cite>
    </>
  );
};

// The guard against the misreading this segment invites. Nothing in the library
// does any of the above; the format is what makes it possible, and that stays on
// screen in both modes.
const NoLib: React.FC = () => (
  <Punch text={lever.nolib} sub={lever.nolibSub} maxWidth={1460} size={58} />
);

export const C5Lever: React.FC = () => (
  <SegmentFrame id="C5" kicker={lever.kicker}>
    <Contract />
    <Pipe />
    <Roundtrip />
    <NoLib />
  </SegmentFrame>
);
