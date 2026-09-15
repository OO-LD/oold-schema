import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Kicker } from '../../../shared/components/Type';
import { colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { Chip, Punch, SceneTitle } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S3');

const DOMAIN_W = 320;
const CHIP_W = 250;
const CHIP_GAP = 16;
const CELLS_W = CHIP_W * 3 + CHIP_GAP * 2;
const ASK_W = 170;
const COL_GAP = 26;

// The right-hand column of every row: the question the receiving system is left
// with once it has all three documents in front of it.
const Ask: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        width: 96,
        height: 62,
        borderRadius: 12,
        border: `2px dashed ${colors.hairline}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.mono,
        fontSize: type.caption.size,
        fontWeight: 700,
        color: colors.muted,
        ...enterUp(frame, delay, 18, 12),
      }}
    >
      {copy.synonyms.ask}
    </div>
  );
};

const Row: React.FC<{
  domain: string;
  means: string;
  cells: string[];
  delay: number;
}> = ({ domain, means, cells, delay }) => {
  const frame = useFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: COL_GAP }}>
      <div style={{ width: DOMAIN_W, textAlign: 'right' }}>
        <div
          style={{
            fontSize: type.body.size,
            fontWeight: 700,
            color: colors.ink,
            ...enterUp(frame, delay, 18, 16),
          }}
        >
          {domain}
        </div>
        <div
          style={{
            fontSize: type.label.size,
            color: colors.muted,
            marginTop: 4,
            ...enterUp(frame, delay + 8, 18, 14),
          }}
        >
          {means}
        </div>
      </div>

      <div style={{ display: 'flex', gap: CHIP_GAP }}>
        {cells.map((c, i) => (
          <Chip key={c} text={c} width={CHIP_W} delay={delay + 14 + i * 9} />
        ))}
      </div>

      <div style={{ width: ASK_W, display: 'flex', justifyContent: 'center' }}>
        <Ask delay={delay + 72} />
      </div>
    </div>
  );
};

export const S3Synonyms: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.synonyms.kicker}</Kicker>
      </div>

      <SceneTitle delay={0}>{copy.synonyms.title}</SceneTitle>

      <div style={{ height: 16 }} />
      <div
        style={{
          fontSize: type.body.size,
          color: colors.muted,
          ...enterUp(frame, 18, 20, 16),
        }}
      >
        {copy.synonyms.lead}
      </div>

      <div style={{ height: 40 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: COL_GAP }}>
        <div style={{ width: DOMAIN_W }} />
        <div style={{ width: CELLS_W }} />
        <div
          style={{
            width: ASK_W,
            textAlign: 'center',
            fontSize: type.label.size,
            fontWeight: type.label.weight,
            letterSpacing: type.label.tracking,
            color: colors.muted,
            opacity: fadeIn(frame, 124, 18),
          }}
        >
          {copy.synonyms.askLabel}
        </div>
      </div>

      <div style={{ height: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        {copy.synonyms.rows.map((r, i) => (
          <Row
            key={r.domain}
            domain={r.domain}
            means={r.means}
            cells={r.cells}
            delay={64 + i * 44}
          />
        ))}
      </div>

      <div style={{ height: 52 }} />
      <div
        style={{
          fontSize: type.body.size,
          lineHeight: type.body.leading,
          color: colors.muted,
          maxWidth: 1400,
          ...enterUp(frame, 300, 20, 18),
        }}
      >
        {copy.synonyms.missing}
      </div>

      <div style={{ height: 26 }} />
      <Punch delay={372} maxWidth={1440}>
        {copy.synonyms.punch}
      </Punch>
    </Stage>
  );
};
