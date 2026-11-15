import { cn } from '@/shared/lib/utils';
import type { OwnProxy } from '@/shared/model';
import { StatusDot, type StatusTone } from '@/shared/ui/StatusDot';

import { healthText, healthTone } from '../model/proxy-health';

const TEXT_CLASS: Record<StatusTone, string> = {
  busy: 'text-accent',
  bad: 'text-fp-red',
  warn: 'text-fp-amber',
  ok: 'text-fp-ink',
  idle: 'text-fp-muted2',
};

export function HealthCell({ proxy, testing }: { proxy: OwnProxy; testing: boolean }) {
  const tone = healthTone(proxy, testing);

  return (
    <span className="flex min-w-0 items-center gap-2">
      <StatusDot tone={tone} pulse={testing} />
      <span className={cn('truncate text-sm font-semibold tabular-nums', TEXT_CLASS[tone])}>
        {healthText(proxy, testing)}
      </span>
    </span>
  );
}
