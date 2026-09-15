import React from 'react';
import { Audio, Fill, Sequence, getInputProps, staticFile } from '@rendiv/core';
import { OVERLAP, ThemeName, applyTheme, colors } from '../../shared/theme';
import { scenes, TOTAL } from './timeline';
import { S1Open } from './scenes/S1Open';
import { S2Validate } from './scenes/S2Validate';
import { S3Declare } from './scenes/S3Declare';
import { S4Bind } from './scenes/S4Bind';
import { S5Jsonld } from './scenes/S5Jsonld';
import { S6Codegen } from './scenes/S6Codegen';
import { S7Query } from './scenes/S7Query';
import { S8Close } from './scenes/S8Close';

export const DURATION = TOTAL;

const LAST = scenes[scenes.length - 1].id;

const byId: Record<string, React.FC> = {
  S1: S1Open,
  S2: S2Validate,
  S3: S3Declare,
  S4: S4Bind,
  S5: S5Jsonld,
  S6: S6Codegen,
  S7: S7Query,
  S8: S8Close,
};

export const Ep5Python: React.FC = () => {
  // Applied above every scene so the palette is set before any child reads it.
  // Chosen with --props '{"theme":"dark"}'.
  const props = getInputProps<{ theme?: ThemeName; voiced?: boolean }>();
  applyTheme(props.theme ?? 'light');
  // Silent by default, like episodes 1 to 4: the series is text on screen and
  // the voice track is opt-in with --props '{"voiced":true}'. The clips live in
  // public/audio and are described in src/narration.json.
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
            {voiced ? <Audio src={staticFile(`audio/${s.id.toLowerCase()}.wav`)} /> : null}
            {/* The stitcher passes -shortest to ffmpeg unconditionally, so the
                mux ends at whichever stream runs out first. Narration stops
                well before the end of the closing scene, which would clip the
                last frames off the video. tail.wav is silence covering the
                closing scene, so audio outlasts the picture and the episode
                keeps its full length. Regenerate with:
                  ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 23 \
                    -c:a pcm_s16le public/audio/tail.wav */}
            {voiced && s.id === LAST ? <Audio src={staticFile('audio/tail.wav')} /> : null}
          </Sequence>
        );
      })}
    </Fill>
  );
};
