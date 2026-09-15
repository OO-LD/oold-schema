import React from 'react';
import { Composition, setRootComponent } from '@rendiv/core';
import { loadFonts } from '../../shared/lib/fonts';
import { FPS, HEIGHT, WIDTH } from '../../shared/theme';
import { Ep2Anatomy, DURATION } from './Episode';

loadFonts();

const Root: React.FC = () => (
  <Composition
    id="Ep2Anatomy"
    component={Ep2Anatomy}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);

setRootComponent(Root);
