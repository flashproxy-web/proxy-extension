import { cn } from '@/shared/lib/utils';

import { Kicker } from './Kicker';
import { SectionTitle } from './SectionTitle';

import type { StepCopy } from '../config';

export type StepTone = 'done' | 'todo' | 'idle';

const TONE_CLASS: Record<StepTone, string> = {
  done: 'bg-fp-green text-white',
  todo: 'bg-fp-soft text-fp-accent-ink',
  idle: 'bg-fp-panel text-fp-muted2',
};

export function StepHead({ tone, label, copy }: { tone: StepTone; label: string; copy: StepCopy }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-7 flex-none items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors',
            TONE_CLASS[tone]
          )}
        >
          {label}
        </span>
        <Kicker>{copy.kicker}</Kicker>
      </div>
      <SectionTitle className="mt-1">{copy.title}</SectionTitle>
      <p className="text-fp-muted text-sm leading-relaxed text-pretty">{copy.description}</p>
    </div>
  );
}
