import React from 'react';
import { Composition, setRootComponent } from '@rendiv/core';
import { loadFonts } from './lib/fonts';
import { CORE_DURATION, FPS, HEIGHT, MSE_DURATION, segments, WIDTH } from './timeline';
import { standalone, Talk, TalkCore } from './Talk';

loadFonts();

// Built once rather than inside Root's render: a component created per render
// is a new identity every time, which remounts the tree it wraps for no reason.
const standalones: Record<string, React.FC> = Object.fromEntries(
  segments.map((s) => [s.id, standalone(s.id)]),
);

// Three things are renderable:
//
//   Talk       the MSE 2026 cut, core plus the conference framing
//   TalkCore   the same core with nothing naming a conference
//   <id>       one segment on its own, for advancing by hand or re-rendering
//              a single change
//
// The segment compositions are not a studio convenience. Segments hard-cut, so
// the stitched file of all of them is the same video as the continuous cut, and
// a speaker who wants to control the pace plays them one at a time instead.
const Root: React.FC = () => (
  <>
    <Composition
      id="Talk"
      component={Talk}
      durationInFrames={MSE_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="TalkCore"
      component={TalkCore}
      durationInFrames={CORE_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {segments.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={standalones[s.id]}
        durationInFrames={s.duration}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
  </>
);

setRootComponent(Root);
