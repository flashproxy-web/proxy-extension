import { cn } from '@/shared/lib/utils';

import { PULSE_DURATION } from '../config';

export function PulseRing({ className }: { className?: string }) {
  return (
    <span
      className={cn('border-accent absolute animate-ping border-2', className)}
      style={{ animationDuration: PULSE_DURATION }}
    />
  );
}
