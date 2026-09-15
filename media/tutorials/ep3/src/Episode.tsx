import React from 'react';
import { Audio, Fill, Sequence, getInputProps, staticFile } from '@rendiv/core';
import { OVERLAP, ThemeName, applyTheme, colors } from '../../shared/theme';
import { DURATION as TOTAL, scenes } from './timeline';
import { S1Open } from './scenes/S1Open';
import { S2HasA } from './scenes/S2HasA';
import { S3IsA } from './scenes/S3IsA';
import { S4Difference } from './scenes/S4Difference';
import { S5Reflection } from './scenes/S5Reflection';
import { S5bMerge } from './scenes/S5bMerge';
import { S6Closing } from './scenes/S6Closing';
import { S7Together } from './scenes/S7Together';

export const DURATION = TOTAL;

// The muxer passes -shortest, so the mp4 stops at whichever stream ends first.
// The last narration clip ends 214 frames before the episode does, which would
// cut those frames off the video. tail-silence.wav holds the audio track open to
// the final frame. Regenerate with:
//   ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 24 -c:a pcm_s16le \
//     public/audio/tail-silence.wav
const LAST = scenes[scenes.length - 1].id;

const byId: Record<string, React.FC> = {
  S1: S1Open,
  S2: S2HasA,
  S3: S3IsA,
  S4: S4Difference,
  S5: S5Reflection,
  S5b: S5bMerge,
  S6: S6Closing,
  S7: S7Together,
};

export const Ep3Composition: React.FC = () => {
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
      return (
        <Sequence
          key={s.id}
          name={s.title}
          from={s.from}
          durationInFrames={s.duration + OVERLAP}
        >
          <Scene />
          <Audio src={staticFile(`audio/${s.id.toLowerCase()}.wav`)} />
          {s.id === LAST ? <Audio src={staticFile('audio/tail-silence.wav')} /> : null}
        </Sequence>
      );
    })}
  </Fill>
  );
};
