import React from 'react';
import { Fill } from '@rendiv/core';
import { icons, IconKey } from '../components/Icons';
import { colors, fonts } from '../theme';

const order: IconKey[] = ['oold', 'validate', 'code', 'graph', 'doc', 'store'];

export const IconSheet: React.FC = () => (
  <Fill style={{ background: colors.bg, fontFamily: fonts.sans }}>
    {['#FFFFFF', '#1A1A1A'].map((bg, row) => (
      <div
        key={bg}
        style={{
          position: 'absolute',
          top: row * 540,
          left: 0,
          width: 1920,
          height: 540,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {order.map((k) => {
          const Icon = icons[k];
          return <Icon key={k} size={240} />;
        })}
      </div>
    ))}
  </Fill>
);
