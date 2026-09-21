import React from 'react';
import { Sequence, useFrame } from '@rendiv/core';
import { Stage } from '../../../shared/components/Stage';
import { Caption } from '../../../shared/components/Type';
import { Group } from '../../../shared/components/CodeBlock';
import { colors, fonts, OVERLAP, type } from '../../../shared/theme';
import { fadeIn, progress, sceneOpacity } from '../../../shared/lib/motion';
import {
  copy,
  personContextFragment,
  personContextLines,
  personOoldLines,
  personSchema,
  personStructureLines,
} from '../copy';
import { sceneById } from '../timeline';
import { Bullet, DefRow, FileView, Spacer, groupPicker } from './parts';

const scene = sceneById('S9');
const A = 320;
const B = 230;
const C = scene.duration - A - B;

const groupOf = groupPicker(personContextLines, personStructureLines, personOoldLines);
const allContext = (): Group => 'context';

const FileTag: React.FC<{ delay?: number; align?: 'center' | 'left' }> = ({
  delay = 0,
  align = 'center',
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: type.label.size,
        fontWeight: type.label.weight,
        letterSpacing: type.label.tracking,
        color: colors.muted,
        textAlign: align,
        opacity: fadeIn(frame, delay, 16),
      }}
    >
      {copy.person.kicker}
    </div>
  );
};

const TopFileLabel: React.FC = () => (
  <div style={{ position: 'absolute', top: 46, left: 0, right: 0 }}>
    <FileTag />
  </div>
);

// The whole file at once. 26 lines at the shared code leading is what sets the
// type size here: at 20px the card is 915px tall and keeps an 80px margin.
const BeatFile: React.FC = () => {
  const frame = useFrame();
  const colorOf = [colors.muted, colors.oold_ink, colors.muted];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 54 }}>
      <FileView
        code={personSchema}
        groupOf={groupOf}
        fontSize={20}
        reveal={progress(frame, 6, 90)}
        wash={{
          context: progress(frame, 100, 22),
          schema: progress(frame, 112, 22),
          oold: progress(frame, 126, 22),
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: 540 }}>
        <FileTag align="left" />
        {copy.person.notes.map((n, i) => (
          <Bullet key={n} delay={150 + i * 30} color={colorOf[i]} width={540} size={29}>
            {n}
          </Bullet>
        ))}
      </div>
    </div>
  );
};

const BeatContext: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <TopFileLabel />
      <div
        style={{
          fontSize: 34,
          fontWeight: 600,
          color: colors.context,
          opacity: fadeIn(frame, 0, 16),
        }}
      >
        {copy.person.contextLead}
      </div>
      <Spacer h={30} />
      <FileView
        code={personContextFragment}
        groupOf={allContext}
        wash={{ context: 1 }}
        reveal={progress(frame, 10, 44)}
      />
      <Spacer h={40} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {copy.person.contextNotes.map((n, i) => (
          <Bullet key={n} delay={70 + i * 26} color={colors.context} width={1240} size={30}>
            {n}
          </Bullet>
        ))}
      </div>
    </>
  );
};

const BeatKeywords: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <TopFileLabel />
      <div
        style={{
          fontSize: 34,
          fontWeight: 600,
          color: colors.oold_ink,
          opacity: fadeIn(frame, 0, 16),
        }}
      >
        {copy.person.keywordsLead}
      </div>
      <Spacer h={34} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {copy.person.keywords.map((k, i) => (
          <DefRow
            key={k.code}
            code={k.code}
            note={k.note}
            color={colors.oold_ink}
            delay={8 + i * 18}
            width={1100}
          />
        ))}
      </div>
      <Spacer h={40} />
      <Caption delay={118} size={30} color={colors.muted} maxWidth={1300}>
        {copy.person.keywordsCaption}
      </Caption>
    </>
  );
};

export const S9Person: React.FC = () => {
  const frame = useFrame();
  return (
    <Stage opacity={sceneOpacity(frame, scene.duration)} padY={62}>
      <Sequence from={0} durationInFrames={A} layout="none">
        <BeatFile />
      </Sequence>
      <Sequence from={A} durationInFrames={B} layout="none">
        <BeatContext />
      </Sequence>
      <Sequence from={A + B} durationInFrames={C + OVERLAP} layout="none">
        <BeatKeywords />
      </Sequence>
    </Stage>
  );
};
