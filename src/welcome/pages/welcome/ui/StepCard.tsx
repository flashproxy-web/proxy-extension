import { Card } from '@/shared/ui/card';

import { StepHead, type StepTone } from './StepHead';

import type { StepCopy } from '../config';
import type { ReactNode } from 'react';

const DONE_LABEL = '✓';

export function StepCard({
  tone,
  label,
  copy,
  children,
}: {
  tone: StepTone;
  label: string;
  copy: StepCopy;
  children: ReactNode;
}) {
  return (
    <Card className="fp-card grid items-start gap-7 rounded-xl p-7 shadow-none md:grid-cols-5">
      <div className="min-w-0 md:col-span-2">
        <StepHead tone={tone} label={tone === 'done' ? DONE_LABEL : label} copy={copy} />
      </div>
      <div className="flex min-w-0 flex-col gap-2.5 md:col-span-3">{children}</div>
    </Card>
  );
}
