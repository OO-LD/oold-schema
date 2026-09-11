import React from 'react';
import { useCompositionConfig, useFrame } from '@rendiv/core';
import { Stage } from '../components/Stage';
import { Caption, Kicker } from '../components/Type';
import { icons } from '../components/Icons';
import { copy } from '../copy';
import { brand, colors, sceneById } from '../theme';
import { fadeIn, pop, sceneOpacity } from '../lib/motion';

const scene = sceneById('S4');
const accent = [brand.doc, brand.graph, brand.store];

const Card: React.FC<{
  title: string;
  body: string;
  icon: keyof typeof icons;
  color: string;
  delay: number;
}> = ({ title, body, icon, color, delay }) => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const s = pop(frame, fps, delay, 16);
  const Icon = icons[icon];
  return (
    <div
      style={{
        width: 486,
        background: colors.panel,
        border: `2px solid ${colors.hairline}`,
        borderTop: `8px solid ${color}`,
        borderRadius: 18,
        padding: '34px 38px 40px',
        boxShadow: '0 16px 40px rgba(16,16,16,0.05)',
        opacity: fadeIn(frame, delay, 18),
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      <Icon size={104} />
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 12, marginBottom: 16 }}>{title}</div>
      <div style={{ fontSize: 30, lineHeight: 1.45, color: colors.muted }}>{body}</div>
    </div>
  );
};

export const S4Domains: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)} justify="center">
      <div>
        <Kicker color={colors.muted}>{copy.domains.kicker}</Kicker>
      </div>

      <div style={{ display: 'flex', gap: 42, alignItems: 'stretch' }}>
        {copy.domains.cards.map((c, i) => (
          <Card
            key={c.title}
            title={c.title}
            body={c.body}
            icon={c.icon}
            color={accent[i]}
            delay={24 + i * 70}
          />
        ))}
      </div>

      <div style={{ height: 70 }} />
      <div>
        <Caption delay={470} size={34} color={colors.ink} maxWidth={1380}>
          {copy.domains.closing}
        </Caption>
      </div>
    </Stage>
  );
};
