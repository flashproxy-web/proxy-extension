import { Check } from 'lucide-react';

import { PLAN_ICON, planIsDead, planLeftLabel, usePopup } from '@/popup/entities/connection';
import { BRAND_GRADIENT } from '@/popup/shared/config';
import { DynamicIcon } from '@/popup/shared/ui/DynamicIcon';
import { send } from '@/shared/api/client';
import { TOAST_INFO } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import type { Plan } from '@/shared/model';
import { Button } from '@/shared/ui/button';

export function PlanMenuRow({ plan }: { plan: Plan }) {
  const { model, setUi, toast } = usePopup();
  const dead = planIsDead(plan);
  const selected = !model.isOwn && model.plan?.id === plan.id;
  const close = () => setUi({ srcOpen: false });
  const pick = () => {
    if (dead) return;
    close();
    send({ type: 'pickPlan', planId: plan.id });
  };
  const renew = () => {
    close();
    toast({ text: 'Opening renewal for ' + plan.name, icon: 'external-link', color: TOAST_INFO });
    send({ type: 'open', target: { kind: 'web', page: 'renew' } });
  };
  return (
    <div
      className={cn(
        'plan-row flex items-center gap-2 rounded-sm px-2 py-1.5',
        selected && 'bg-fp-soft'
      )}
    >
      <Button
        variant="ghost"
        className={cn(
          'h-auto min-w-0 flex-1 shrink justify-start gap-2.5 p-0 text-left font-normal! hover:bg-transparent!',
          dead ? 'cursor-default opacity-55' : 'cursor-pointer'
        )}
        aria-disabled={dead}
        onClick={pick}
      >
        <span
          className={cn(
            'flex size-7 flex-none items-center justify-center rounded-sm text-white',
            dead ? 'bg-fp-muted2' : BRAND_GRADIENT
          )}
        >
          <DynamicIcon name={PLAN_ICON[plan.kind]} className="size-3.5!" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{plan.name}</span>
          <span className={cn('block text-xs', dead ? 'text-fp-amber' : 'text-fp-muted2')}>
            {planLeftLabel(plan)}
          </span>
        </span>
      </Button>
      {dead ? (
        <Button className="h-6.5 flex-none px-2.5 text-xs font-semibold!" onClick={renew}>
          Renew
        </Button>
      ) : null}
      {selected ? <Check className="text-accent size-4 flex-none" /> : null}
    </div>
  );
}
