import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { CodeBlock, Group } from '../../../shared/components/CodeBlock';
import { brand, colors, fonts, OVERLAP } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  ArrowDown,
  Bullet,
  Note,
  PanelLabel,
  SceneKicker,
  SceneTitle,
  Statement,
} from '../components/Parts';
import {
  copy,
  packageBase,
  relativeSchema,
  resolvedSchema,
  schemaIdentity,
  versionedInstance,
} from '../copy';
import { sceneById } from '../timeline';

const scene = sceneById('S8');
const A = 560;
const B = scene.duration - A;

// Line 2 is @context, line 3 is $schema in the pinned instance.
const pinnedGroup = (lineNo: number): Group =>
  lineNo === 2 ? 'context' : lineNo === 3 ? 'schema' : 'plain';

const BeatVersion: React.FC = () => {
  const frame = useFrame();

  return (
    <>
      <SceneTitle>{copy.version.title}</SceneTitle>

      <div style={{ height: 30 }} />
      <div style={{ display: 'flex', gap: 70, alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'left', opacity: fadeIn(frame, 20, 18) }}>
          <PanelLabel text={copy.version.schemaLabel} color={brand.validate} delay={20} />
          <CodeBlock code={schemaIdentity} groupOf={() => 'schema'} fontSize={23} />
          <div style={{ height: 20 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {copy.version.schemaPoints.map((p, i) => (
              <Bullet key={p} text={p} color={brand.validate} delay={90 + i * 24} size={24} />
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'left', width: 560 }}>
          <PanelLabel text={copy.version.locationLabel} color={colors.muted} delay={160} />
          <div style={{ height: 6 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {copy.version.locations.map((l, i) => (
              <Bullet key={l} text={l} color={colors.oold} delay={180 + i * 30} size={25} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 34 }} />
      <div style={{ textAlign: 'left', opacity: fadeIn(frame, 330, 20) }}>
        <PanelLabel text={copy.version.instanceLabel} color={colors.oold_ink} delay={330} />
        <CodeBlock code={versionedInstance} groupOf={pinnedGroup} fontSize={21} />
      </div>

      <div style={{ height: 24 }} />
      <Note delay={420} maxWidth={1420} color={colors.ink}>
        {copy.version.note}
      </Note>
    </>
  );
};

// Closes the loop on every bare file name shown since episode 2: those names are
// relative URIs, and this is what they resolve against.
const BeatBase: React.FC = () => {
  const frame = useFrame();

  return (
    <>
      <SceneTitle>{copy.base.title}</SceneTitle>

      <div style={{ height: 28 }} />
      <div style={{ opacity: fadeIn(frame, 16, 18) }}>
        <CodeBlock
          code={relativeSchema}
          groupOf={() => 'schema'}
          fontSize={23}
          reveal={progress(frame, 22, 60)}
        />
      </div>

      <div style={{ height: 16 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <ArrowDown delay={120} height={54} />
        <div style={{ textAlign: 'left' }}>
          <PanelLabel text={copy.base.baseLabel} color={colors.muted} delay={128} />
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 21,
              color: colors.oold_ink,
              opacity: fadeIn(frame, 136, 18),
            }}
          >
            {packageBase}
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />
      <div style={{ opacity: fadeIn(frame, 190, 18) }}>
        <CodeBlock
          code={resolvedSchema}
          groupOf={() => 'schema'}
          fontSize={17}
          reveal={progress(frame, 198, 70)}
        />
      </div>

      <div style={{ height: 26 }} />
      <Statement
        text={copy.base.note}
        source={copy.base.source}
        delay={300}
        maxWidth={1400}
        size={28}
      />
    </>
  );
};

export const S8Version: React.FC = () => {
  const frame = useFrame();

  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)}>
      <SceneKicker>{copy.version.kicker}</SceneKicker>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatVersion />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <BeatBase />
      </Sequence>
    </Stage>
  );
};
