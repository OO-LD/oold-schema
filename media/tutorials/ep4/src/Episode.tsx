import React from 'react';
import { Audio, Fill, Sequence, getInputProps, staticFile } from '@rendiv/core';
import { OVERLAP, ThemeName, applyTheme, colors } from '../../shared/theme';
import { DURATION as TOTAL, scenes } from './timeline';
import { S1Open } from './scenes/S1Open';
import { S2Instance } from './scenes/S2Instance';
import { S3Identity } from './scenes/S3Identity';
import { S4Expand } from './scenes/S4Expand';
import { S5Forms } from './scenes/S5Forms';
import { S6Reference } from './scenes/S6Reference';
import { S7Graph } from './scenes/S7Graph';
import { S8Version } from './scenes/S8Version';
import { S9Close } from './scenes/S9Close';

const byId: Record<string, React.FC> = {
  S1: S1Open,
  S2: S2Instance,
  S3: S3Identity,
  S4: S4Expand,
  S5: S5Forms,
  S6: S6Reference,
  S7: S7Graph,
  S8: S8Version,
  S9: S9Close,
};

// Narration clip per scene, from src/narration.json. S5 has none: it is a list
// of three parallel rows, and it is read rather than heard.
const clipOf: Record<string, string | undefined> = {
  S1: 's1',
  S2: 's2',
  S3: 's3',
  S4: 's4',
  S6: 's6',
  S7: 's7',
  S8: 's8',
  S9: 's9',
};

export const DURATION = TOTAL;

export const Ep4Graph: React.FC = () => {
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
      const clip = clipOf[s.id];
      return (
        <Sequence
          key={s.id}
          name={s.title}
          from={s.from}
          durationInFrames={s.duration + OVERLAP}
        >
          <Scene />
          {voiced && clip ? <Audio src={staticFile(`audio/${clip}.wav`)} /> : null}
          {/* The renderer muxes with ffmpeg -shortest, so the mixed audio track
              ending before the last video frame truncates the video to it. The
              last narration clip stops 206 frames early, which would cut the
              Episode 5 card. This silence runs past the end of the composition
              and is itself trimmed to the Sequence, so audio is never the
              shorter stream. Silent, so it changes nothing that is heard. */}
          {s.id === 'S9' ? <Audio src={staticFile('audio/tail.wav')} /> : null}
        </Sequence>
      );
    })}
  </Fill>
  );
};
