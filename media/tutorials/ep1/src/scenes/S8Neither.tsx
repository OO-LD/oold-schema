import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption, Kicker } from '../../../shared/components/Type';
import { IconGraph, IconValidate } from '../../../shared/components/Icons';
import { brand, colors, type } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { SceneTitle, YesNo } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S8');

const LABEL_W = 420;
const COL_W = 360;
// Resolved at render time: applyTheme swaps the palette after this module is
// imported, so a value captured here would stay light in the dark render.
const colColor = () => [colors.validate, colors.graph];
const colIcon = [IconValidate, IconGraph];

export const S8Neither: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.neither.kicker}</Kicker>
      </div>

      <SceneTitle delay={0}>{copy.neither.title}</SceneTitle>
      <div style={{ height: 52 }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: LABEL_W }} />
          {copy.neither.cols.map((c, i) => {
            const Icon = colIcon[i];
            return (
              <div
                key={c}
                style={{
                  width: COL_W,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  ...enterUp(frame, 40 + i * 14, 18, 16),
                }}
              >
                <Icon size={66} />
                <div style={{ fontSize: type.body.size, fontWeight: 700, color: colColor()[i] }}>
                  {c}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 26 }} />

        {copy.neither.rows.map((r, ri) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderTop: `2px solid ${colors.hairline}`,
              paddingTop: 24,
              paddingBottom: 24,
              opacity: fadeIn(frame, 96 + ri * 40, 18),
            }}
          >
            <div
              style={{
                width: LABEL_W,
                textAlign: 'left',
                fontSize: type.body.size,
                fontWeight: 600,
                color: colors.ink,
              }}
            >
              {r.label}
            </div>
            {r.values.map((v, ci) => (
              <div
                key={copy.neither.cols[ci]}
                style={{ width: COL_W, display: 'flex', justifyContent: 'center' }}
              >
                <YesNo yes={v} color={colColor()[ci]} delay={124 + ri * 40 + ci * 16} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ height: 50 }} />
      <Caption delay={330} color={colors.ink} maxWidth={1440}>
        {copy.neither.caption}
      </Caption>
    </Stage>
  );
};
