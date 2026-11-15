import { ArrowUpRight, Check } from 'lucide-react';

import { LOW_BANDWIDTH_PCT, PLAN_ICONS } from '@/dashboard/shared/config';
import { ToneBadge } from '@/dashboard/shared/ui/ToneBadge';
import { FP_LINKS } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import type { Plan } from '@/shared/model';
import { Card } from '@/shared/ui/card';

import { planUsage } from '../model/plan-usage';

export function PlanCard({ plan, inUse }: { plan: Plan; inUse: boolean }) {
  const { dead, exhausted, unlimited, percentLeft, line } = planUsage(plan);
  const PlanIcon = PLAN_ICONS[plan.kind];

  return (
    <Card className={cn('fp-card gap-3.5 p-4.5', inUse && 'border-accent! ring-accent/10 ring-3')}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-9.5 shrink-0 items-center justify-center rounded-lg',
            dead ? 'bg-fp-panel' : 'bg-fp-soft'
          )}
        >
          <PlanIcon className={cn('size-4.5', dead ? 'text-fp-muted2' : 'text-accent')} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">{plan.name}</div>
          <div
            className={cn('mt-0.5 text-sm', dead || exhausted ? 'text-fp-red' : 'text-fp-muted')}
          >
            {line}
          </div>
        </div>
        {inUse ? (
          <ToneBadge tone="ok">
            <Check />
            In use
          </ToneBadge>
        ) : null}
        {dead ? <ToneBadge tone="bad">Expired</ToneBadge> : null}
      </div>
      {unlimited || dead ? null : <BandwidthMeter percentLeft={percentLeft} />}
      <a
        href={dead ? FP_LINKS.renew : FP_LINKS.account}
        target="_blank"
        rel="noreferrer"
        className="text-fp-accent-ink inline-flex items-center gap-1.5 self-start text-sm font-semibold hover:underline"
      >
        {dead ? 'Renew on flashproxy.com' : 'Manage on flashproxy.com'}
        <ArrowUpRight className="size-3.5" />
      </a>
    </Card>
  );
}

function BandwidthMeter({ percentLeft }: { percentLeft: number }) {
  return (
    <div className="bg-fp-panel ring-fp-line h-1.5 overflow-hidden rounded-full ring-1 ring-inset">
      <div
        className={cn(
          'h-full rounded-full',
          percentLeft < LOW_BANDWIDTH_PCT ? 'bg-fp-amber' : 'bg-accent'
        )}
        style={{ width: percentLeft + '%' }}
      />
    </div>
  );
}
