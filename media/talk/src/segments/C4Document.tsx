import React from 'react';
import { useFrame } from '@rendiv/core';
import { SegmentFrame } from '../components/Chrome';
import { Gap, Note, Punch } from '../components/Parts';
import { CodeBlock, Group } from '../components/CodeBlock';
import { colors } from '../theme';
import { contextLines, document as doc, minimalSchema, schemaLines } from '../copy';
import { enterUp, progress } from '../lib/motion';

const groupOf = (lineNo: number): Group =>
  contextLines.includes(lineNo) ? 'context' : schemaLines.includes(lineNo) ? 'schema' : 'plain';

const Code: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <CodeBlock code={minimalSchema} groupOf={groupOf} reveal={progress(frame, 8, 130)} />
      <Gap h={38} />
      <Note delay={160} size={28} maxWidth={1200}>
        {doc.codeCaption}
      </Note>
    </>
  );
};

const Label: React.FC<{ text: string; color: string; delay: number }> = ({
  text,
  color,
  delay,
}) => {
  const frame = useFrame();
  return (
    <div
      style={{
        fontSize: 30,
        fontWeight: 700,
        color,
        ...enterUp(frame, delay, 20, 14),
      }}
    >
      {text}
    </div>
  );
};

const Wash: React.FC = () => {
  const frame = useFrame();
  return (
    <>
      <div style={{ display: 'flex', gap: 64, justifyContent: 'center', marginBottom: 26 }}>
        <Label text={doc.washContext} color={colors.context} delay={50} />
        <Label text={doc.washSchema} color={colors.schema} delay={110} />
      </div>
      <CodeBlock
        code={minimalSchema}
        groupOf={groupOf}
        wash={{ context: progress(frame, 50, 26), schema: progress(frame, 110, 26) }}
      />
      <Gap h={34} />
      <Note delay={170} size={32} color={colors.ink} maxWidth={1300}>
        {doc.claim}
      </Note>
    </>
  );
};

const PunchBeat: React.FC = () => <Punch text={doc.punch} sub={doc.punchSub} maxWidth={1440} />;

export const C4Document: React.FC = () => (
  <SegmentFrame id="C4" kicker={doc.kicker}>
    <Code />
    <Wash />
    <PunchBeat />
  </SegmentFrame>
);
