import { fmtDay } from '@/shared/lib/format';
import type { Plan } from '@/shared/model';

interface PlanUsage {
  dead: boolean;
  exhausted: boolean;
  unlimited: boolean;
  percentLeft: number;
  line: string;
}

export function planUsage(plan: Plan): PlanUsage {
  const dead = plan.status !== 'active';
  const unlimited = plan.gbLeft === null;
  const gbLeft = plan.gbLeft ?? 0;
  const exhausted = plan.gbLeft !== null && plan.gbLeft <= 0;
  const percentLeft = unlimited || !plan.gbTotal ? 0 : Math.round((gbLeft / plan.gbTotal) * 100);
  return { dead, exhausted, unlimited, percentLeft, line: usageLine(plan, dead, unlimited) };
}

function usageLine(plan: Plan, dead: boolean, unlimited: boolean): string {
  if (dead) return 'Expired ' + fmtDay(plan.expiredAt);
  if (unlimited)
    return 'Unlimited bandwidth' + (plan.renewsAt ? ' · Renews ' + fmtDay(plan.renewsAt) : '');
  return `${(plan.gbLeft ?? 0).toFixed(1)} GB left of ${plan.gbTotal} GB`;
}
