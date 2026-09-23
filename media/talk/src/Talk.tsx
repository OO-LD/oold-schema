import React from 'react';
import { Fill, Sequence, getInputProps } from '@rendiv/core';
import { applyTheme, colors, ThemeName } from './theme';
import { applyMode, Mode } from './view';
import { coreCut, mseCut, Placed } from './timeline';
import { byId } from './segments';

type Props = { theme?: ThemeName; mode?: Mode };

// Applied above every segment, so the palette and the mode are set before any
// child reads them. Chosen with
// --props '{"theme":"dark","mode":"explain"}'.
//
// Every standalone segment composition calls this too. A segment rendered on its
// own does not pass through either deck component, and without this it would
// come out in the light palette whatever was asked for, silently.
export const applyChrome = (): void => {
  const props = getInputProps<Props>();
  applyTheme(props.theme ?? 'light');
  applyMode(props.mode ?? 'presentation');
};

const Deck: React.FC<{ cut: Placed[] }> = ({ cut }) => {
  applyChrome();
  return (
    <Fill style={{ background: colors.bg }}>
      {cut.map((s) => {
        const Segment = byId[s.id];
        if (!Segment) throw new Error(`No component registered for segment ${s.id}`);
        return (
          <Sequence key={s.id} name={`${s.id} ${s.title}`} from={s.from} durationInFrames={s.duration}>
            <Segment />
          </Sequence>
        );
      })}
    </Fill>
  );
};

// The conference cut: the core with the MSE title card, outlook and
// acknowledgement around it.
export const Talk: React.FC = () => <Deck cut={mseCut} />;

// The same segments with nothing naming a conference, a speaker or an
// institute. This is the one that belongs on oo-ld.org, and it is a filter over
// the same table rather than a second edit of the same slides.
export const TalkCore: React.FC = () => <Deck cut={coreCut} />;

// One segment, rendered on its own, for advancing by hand in front of an
// audience and for re-rendering a single change.
export const standalone = (id: string): React.FC => {
  const Segment = byId[id];
  if (!Segment) throw new Error(`No component registered for segment ${id}`);
  const One: React.FC = () => {
    applyChrome();
    return (
      <Fill style={{ background: colors.bg }}>
        <Segment />
      </Fill>
    );
  };
  return One;
};
