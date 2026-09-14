import React from 'react';
import { Fill, getInputProps, Sequence } from '@rendiv/core';
import { applyTheme, colors, OVERLAP, scenes, ThemeName } from './theme';
import { S1Hook } from './scenes/S1Hook';
import { S2Clarity } from './scenes/S2Clarity';
import { S3Mechanism } from './scenes/S3Mechanism';
import { S4Domains } from './scenes/S4Domains';
import { S5Proof } from './scenes/S5Proof';

const byId: Record<string, React.FC> = {
  S1: S1Hook,
  S2: S2Clarity,
  S3: S3Mechanism,
  S4: S4Domains,
  S5: S5Proof,
};

export const Explainer: React.FC = () => {
  // Applied here, above every scene, so the palette is set before any child reads
  // it. Chosen with --props '{"theme":"dark"}'.
  applyTheme(getInputProps<{ theme?: ThemeName }>().theme ?? 'light');

  return (
  <Fill style={{ background: colors.bg }}>
    {scenes.map((s) => {
      const Scene = byId[s.id];
      return (
        <Sequence
          key={s.id}
          name={s.title}
          from={s.from}
          durationInFrames={s.duration + OVERLAP}
        >
          <Scene />
        </Sequence>
      );
    })}
  </Fill>
  );
};
