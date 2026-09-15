import React from 'react';
import { Audio, Fill, Sequence, getInputProps, staticFile } from '@rendiv/core';
import { OVERLAP, ThemeName, applyTheme, colors } from '../../shared/theme';
import { DURATION as TOTAL, scenes } from './timeline';
import { S1Open } from './scenes/S1Open';
import { S2File } from './scenes/S2File';
import { S3SchemaKeyword } from './scenes/S3SchemaKeyword';
import { S4IdKeyword } from './scenes/S4IdKeyword';
import { S5Context } from './scenes/S5Context';
import { S6Structure } from './scenes/S6Structure';
import { S7Roles } from './scenes/S7Roles';
import { S8Strict } from './scenes/S8Strict';
import { S9Person } from './scenes/S9Person';
import { S10Recap } from './scenes/S10Recap';

export const DURATION = TOTAL;

// The muxer passes -shortest, so the mp4 stops at whichever stream ends first.
// The last narration clip ends 96 frames before the episode does, which would cut
// those frames off the video. tail-silence.wav holds the audio track open to the
// final frame. Regenerate with:
//   ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 20 -c:a pcm_s16le \
//     public/audio/tail-silence.wav
const LAST = scenes[scenes.length - 1].id;

const byId: Record<string, React.FC> = {
  S1: S1Open,
  S2: S2File,
  S3: S3SchemaKeyword,
  S4: S4IdKeyword,
  S5: S5Context,
  S6: S6Structure,
  S7: S7Roles,
  S8: S8Strict,
  S9: S9Person,
  S10: S10Recap,
};

export const Ep2Anatomy: React.FC = () => {
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
        <Sequence key={s.id} name={s.title} from={s.from} durationInFrames={s.duration + OVERLAP}>
          <Scene />
          <Audio src={staticFile(`audio/${s.id.toLowerCase()}.wav`)} />
          {s.id === LAST ? <Audio src={staticFile('audio/tail-silence.wav')} /> : null}
        </Sequence>
      );
    })}
  </Fill>
  );
};
