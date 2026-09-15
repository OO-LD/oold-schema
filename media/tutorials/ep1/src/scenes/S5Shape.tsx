import React from 'react';
import { useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Kicker } from '../../../shared/components/Type';
import { IconValidate } from '../../../shared/components/Icons';
import { brand, colors, fonts, type } from '../../../shared/theme';
import { enterUp, fadeIn, sceneOpacity } from '../../../shared/lib/motion';
import { Chip, SceneTitle, Statement } from '../parts';
import { copy } from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S5');

const PANEL = 640;
const PANEL_H = 268;

const PanelHead: React.FC<{ label: string; sub: string; color: string }> = ({
  label,
  sub,
  color,
}) => (
  <div style={{ textAlign: 'left' }}>
    <div style={{ fontSize: type.caption.size, fontWeight: 700, color }}>{label}</div>
    <div style={{ fontSize: type.label.size, color: colors.muted, marginTop: 4 }}>{sub}</div>
  </div>
);

export const S5Shape: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0 }}>
        <Kicker>{copy.shape.kicker}</Kicker>
      </div>

      <SceneTitle delay={0}>{copy.shape.title}</SceneTitle>
      <div style={{ height: 46 }} />

      <div style={{ display: 'flex', gap: 60, alignItems: 'stretch' }}>
        <div
          style={{
            width: PANEL,
            minHeight: PANEL_H,
            background: colors.schema_wash,
            border: `3px solid ${brand.validate}22`,
            borderRadius: 20,
            padding: '30px 34px',
            textAlign: 'left',
            ...enterUp(frame, 40, 20, 20),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <IconValidate size={62} />
            <PanelHead
              label={copy.shape.says.label}
              sub={copy.shape.says.sub}
              color={brand.validate}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}>
            {copy.shape.says.tokens.map((t, i) => (
              <Chip
                key={t}
                text={t}
                delay={90 + i * 12}
                color={brand.validate}
                border={`${brand.validate}33`}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            width: PANEL,
            minHeight: PANEL_H,
            background: 'transparent',
            border: `3px dashed ${colors.hairline}`,
            borderRadius: 20,
            padding: '30px 34px',
            textAlign: 'left',
            ...enterUp(frame, 70, 20, 20),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 14,
                border: `3px dashed ${colors.hairline}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: fonts.mono,
                fontSize: type.caption.size,
                color: colors.muted,
              }}
            >
              ?
            </div>
            <PanelHead
              label={copy.shape.silent.label}
              sub={copy.shape.silent.sub}
              color={colors.muted}
            />
          </div>
          <div style={{ marginTop: 26 }}>
            {copy.shape.silent.items.map((t, i) => (
              <div
                key={t}
                style={{
                  fontSize: type.body.size,
                  lineHeight: type.body.leading,
                  color: colors.muted,
                  opacity: fadeIn(frame, 120 + i * 16, 16),
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 48 }} />
      <Statement
        text={copy.shape.statement}
        source={copy.shape.source}
        delay={280}
        maxWidth={1280}
      />
    </Stage>
  );
};
