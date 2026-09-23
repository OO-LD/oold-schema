import React from 'react';
import { M0Title } from './M0Title';
import { C0Marks } from './C0Marks';
import { C1Barrier } from './C1Barrier';
import { C2Form } from './C2Form';
import { C3Halves } from './C3Halves';
import { C4Document } from './C4Document';
import { C5Lever } from './C5Lever';
import { C6Underway } from './C6Underway';
import { C7Inversion } from './C7Inversion';
import { C8Unsure } from './C8Unsure';
import { C9Doors } from './C9Doors';
import { C10Cycle } from './C10Cycle';
import { C11Facts } from './C11Facts';
import { M1Outlook } from './M1Outlook';
import { C12Close } from './C12Close';
import { M2Thanks } from './M2Thanks';

// Segment id, exactly as src/timeline.json names it, to the component that
// renders it. Both cuts and every standalone segment composition resolve through
// this one table.
export const byId: Record<string, React.FC> = {
  M0: M0Title,
  C0: C0Marks,
  C1: C1Barrier,
  C2: C2Form,
  C3: C3Halves,
  C4: C4Document,
  C5: C5Lever,
  C6: C6Underway,
  C7: C7Inversion,
  C8: C8Unsure,
  C9: C9Doors,
  C10: C10Cycle,
  C11: C11Facts,
  M1: M1Outlook,
  C12: C12Close,
  M2: M2Thanks,
};
