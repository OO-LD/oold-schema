import React from 'react';
import { setRootComponent, Composition, Still } from '@rendiv/core';
import { Explainer } from './Explainer';
import { IconSheet } from './dev/IconSheet';
import { S1Hook } from './scenes/S1Hook';
import { S2Clarity } from './scenes/S2Clarity';
import { S3Mechanism } from './scenes/S3Mechanism';
import { S4Domains } from './scenes/S4Domains';
import { S5Proof } from './scenes/S5Proof';
import { loadFonts } from './lib/fonts';
import { DURATION, FPS, HEIGHT, OVERLAP, scenes, WIDTH } from './theme';

loadFonts();

const sceneComponents: Record<string, React.FC> = {
  S1: S1Hook,
  S2: S2Clarity,
  S3: S3Mechanism,
  S4: S4Domains,
  S5: S5Proof,
};

const Root: React.FC = () => (
  <>
    <Composition
      id="OOLDExplainer"
      component={Explainer}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {scenes.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={sceneComponents[s.id]}
        durationInFrames={s.duration + OVERLAP}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
    <Still id="IconSheet" component={IconSheet} width={WIDTH} height={HEIGHT} />
  </>
);

setRootComponent(Root);
