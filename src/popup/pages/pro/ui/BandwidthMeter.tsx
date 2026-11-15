import { LOW_BANDWIDTH_RATIO } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { fmtGb } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import type { Plan } from '@/shared/model';
import { Button } from '@/shared/ui/button';

const openTopUp = () => send({ type: 'open', target: { kind: 'web', page: 'topup' } });

export function BandwidthMeter({ plan }: { plan: Plan }) {
  const left = plan.gbLeft ?? 0;
  const total = plan.gbTotal ?? 0;
  const ratio = left / total;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-fp-muted2">{plan.name} bandwidth</span>
        <span className="whitespace-nowrap tabular-nums">
          <b className="font-semibold">{left.toFixed(1)} GB</b>{' '}
          <span className="text-fp-muted2">of {fmtGb(total)} GB left ·</span>{' '}
          <Button
            variant="link"
            className="text-accent h-auto p-0 text-xs font-semibold!"
            onClick={openTopUp}
          >
            Top up
          </Button>
        </span>
      </div>
      <div className="bg-fp-panel ring-fp-line mt-1.75 h-1.5 overflow-hidden rounded-full ring-1 ring-inset">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500',
            ratio < LOW_BANDWIDTH_RATIO ? 'bg-fp-amber' : 'bg-accent'
          )}
          style={{ width: Math.round(100 - ratio * 100) + '%' }}
        />
      </div>
    </div>
  );
}
