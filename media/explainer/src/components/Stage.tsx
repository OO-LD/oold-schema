import React from 'react';
import { Fill } from '@rendiv/core';
import { colors, fonts, layout } from '../theme';

type Props = {
  children: React.ReactNode;
  opacity?: number;
  justify?: 'center' | 'flex-start' | 'space-between';
  padX?: number;
  padY?: number;
};

// Every scene is centred on both axes. Blocks inside only need to set their own
// max width; they do not position themselves.
export const Stage: React.FC<Props> = ({
  children,
  opacity = 1,
  justify = 'center',
  padX = layout.padX,
  padY = layout.padY,
}) => (
  <Fill
    style={{
      background: colors.bg,
      color: colors.ink,
      fontFamily: fonts.sans,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: justify,
      textAlign: 'center',
      padding: `${padY}px ${padX}px`,
      opacity,
    }}
  >
    {children}
  </Fill>
);
