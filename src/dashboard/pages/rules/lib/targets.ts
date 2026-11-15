import type { SnapshotLookup } from '@/dashboard/shared/lib/snapshot-lookup';
import { fpProfileName, planIsDead } from '@/shared/lib/plans';
import type { RuleTarget, Snapshot } from '@/shared/model';

export interface TargetOption {
  target: RuleTarget;
  meta: string;
}

export function targetLabel(target: RuleTarget, lookup: SnapshotLookup): string {
  if (target.kind === 'direct') return 'Direct';
  if (target.kind === 'block') return 'Block';
  if (target.kind === 'fp') {
    const plan = lookup.plans.get(target.planId);
    return plan ? fpProfileName(plan) : 'FlashProxy plan';
  }
  return lookup.proxies.get(target.proxyId)?.label ?? 'Removed proxy';
}

/** Every target a rule can point at, with a short kind label. */
export function allTargets(
  snapshot: Snapshot,
  lookup: SnapshotLookup,
  { direct = true }: { direct?: boolean } = {}
): TargetOption[] {
  const planOptions: TargetOption[] = snapshot.account
    ? snapshot.plans
        .filter((plan) => !planIsDead(plan))
        .map((plan) => ({ target: { kind: 'fp', planId: plan.id }, meta: 'FlashProxy' }))
    : [];
  const proxyOptions: TargetOption[] = snapshot.ownProxies.map((proxy) => ({
    target: { kind: 'own', proxyId: proxy.id },
    meta: lookup.providers.get(proxy.providerId)?.name ?? '',
  }));
  const directOptions: TargetOption[] = direct
    ? [
        { target: { kind: 'direct' }, meta: '' },
        { target: { kind: 'block' }, meta: '' },
      ]
    : [];
  return [...planOptions, ...proxyOptions, ...directOptions];
}

export const targetKey = (target: RuleTarget | null) => JSON.stringify(target);

export const sameTarget = (first: RuleTarget | null, second: RuleTarget | null) =>
  targetKey(first) === targetKey(second);
