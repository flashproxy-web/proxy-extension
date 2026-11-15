import type { Account, Plan, Settings } from '../model';

export const planIsDead = (plan: Plan): boolean =>
  plan.status === 'expired' || (plan.gbLeft !== null && plan.gbLeft <= 0);

export function connectViaPlan(state: {
  settings: Settings;
  plans: Plan[];
  account: Account | null;
}): Plan | undefined {
  if (!state.account) return undefined;
  const alive = state.plans.filter((plan) => !planIsDead(plan));
  const find = (id: string | null | undefined) =>
    id ? alive.find((plan) => plan.id === id) : undefined;
  const active = state.settings.active?.kind === 'fp' ? state.settings.active.planId : null;
  return find(active) ?? find(state.settings.lastPlanId) ?? alive[0];
}

export const fpProfileName = (plan: Plan): string => plan.name;
