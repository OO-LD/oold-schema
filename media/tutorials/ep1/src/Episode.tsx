import React from 'react';
import { Audio, Fill, Sequence, getInputProps, staticFile } from '@rendiv/core';
import { OVERLAP, ThemeName, applyTheme, colors } from '../../shared/theme';
import { DURATION as TOTAL, scenes } from './timeline';
import narration from './narration.json';
import { S1Open } from './scenes/S1Open';
import { S2Collision } from './scenes/S2Collision';
import { S3Synonyms } from './scenes/S3Synonyms';
import { S4Schema } from './scenes/S4Schema';
import { S5Shape } from './scenes/S5Shape';
import { S6Meaning } from './scenes/S6Meaning';
import { S7Loose } from './scenes/S7Loose';
import { S8Neither } from './scenes/S8Neither';
import { S9Consequence } from './scenes/S9Consequence';
import { S10Close } from './scenes/S10Close';

const byId: Record<string, React.FC> = {
  S1: S1Open,
  S2: S2Collision,
  S3: S3Synonyms,
  S4: S4Schema,
  S5: S5Shape,
  S6: S6Meaning,
  S7: S7Loose,
  S8: S8Neither,
  S9: S9Consequence,
  S10: S10Close,
};

// The narration clip of a scene sits inside that scene's Sequence. Outside a
// bounded Sequence an Audio inherits an infinite duration and ffmpeg fails on
// `duration=Infinity`, so the placement is load-bearing, not a style choice.
const clipByScene: Record<string, string> = Object.fromEntries(
  narration.map((n) => [n.scene, n.id]),
);

// The stitcher passes `-shortest` to ffmpeg, so the mp4 ends where the audio
// track ends. The last narration clip stops 395 frames before the composition
// does, which cut the close off at 2:44. A silent clip in the final scene
// carries the track to the end so the video length decides the cut again.
const LAST_SCENE = scenes[scenes.length - 1].id;

export const DURATION = TOTAL;

export const Ep1Principles: React.FC = () => {
  // Applied above every scene so the palette is set before any child reads it.
  // Chosen with --props '{"theme":"dark"}'.
  const props = getInputProps<{ theme?: ThemeName; voiced?: boolean }>();
  applyTheme(props.theme ?? 'light');
  // Silent by default. The narration experiment lives on in
  // src/narration.json; every reviewer found that a voice competes with the
  // on-screen prose rather than adding to it, so it ships off.
  const voiced = props.voiced === true;

  return (
  <Fill style={{ background: colors.bg }}>
    {scenes.map((s) => {
      const Scene = byId[s.id];
      const clip = clipByScene[s.id];
      return (
        <Sequence
          key={s.id}
          name={s.title}
          from={s.from}
          durationInFrames={s.duration + OVERLAP}
        >
          <Scene />
          {voiced && clip ? <Audio src={staticFile(`audio/${clip}.wav`)} /> : null}
          {voiced && s.id === LAST_SCENE ? <Audio src={staticFile('audio/tail-silence.wav')} /> : null}
        </Sequence>
      );
    })}
  </Fill>
  );
};
