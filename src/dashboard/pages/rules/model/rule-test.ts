import type { SnapshotLookup } from '@/dashboard/shared/lib/snapshot-lookup';
import { fpProfileName } from '@/shared/lib/plans';
import { evaluate, ruleType, type Route } from '@/shared/lib/routing';
import type { RuleTarget, Snapshot } from '@/shared/model';

import { targetLabel } from '../lib/targets';

export type RuleTestResult =
  | { lead: string; target: RuleTarget | null; name: string; winner: number | 'default' | 'site' }
  | 'bad'
  | null;

const POPUP_PROXY = 'Your popup proxy';
const DIRECT: RuleTarget = { kind: 'direct' };

function activeTarget(
  snapshot: Snapshot,
  lookup: SnapshotLookup
): { target: RuleTarget | null; name: string } {
  const { active } = snapshot.settings;
  if (active?.kind === 'fp') {
    const plan = lookup.plans.get(active.planId);
    return {
      target: { kind: 'fp', planId: active.planId },
      name: plan ? fpProfileName(plan) : POPUP_PROXY,
    };
  }
  if (active?.kind === 'own')
    return {
      target: { kind: 'own', proxyId: active.proxyId },
      name: lookup.proxies.get(active.proxyId)?.label ?? POPUP_PROXY,
    };
  return { target: null, name: POPUP_PROXY };
}

function routeTestUrl(input: string, snapshot: Snapshot): Route | null {
  try {
    const url = new URL(/^[a-z]+:\/\//i.test(input) ? input : 'https://' + input);
    if (!url.hostname.includes('.')) return null;
    return evaluate(url, snapshot.settings.siteRules, snapshot.rules);
  } catch {
    return null;
  }
}

export function testRuleUrl(
  input: string,
  snapshot: Snapshot,
  lookup: SnapshotLookup
): RuleTestResult {
  const raw = input.trim();
  if (!raw) return null;
  const match = routeTestUrl(raw, snapshot);
  if (!match) return 'bad';
  if (match.source === 'site') {
    const lead = 'Site rule · ' + match.domain;
    if (match.action === 'proxy')
      return { lead, ...activeTarget(snapshot, lookup), winner: 'site' };
    return { lead, target: DIRECT, name: 'Direct', winner: 'site' };
  }
  if (match.source === 'rule')
    return {
      lead: `Rule ${match.index + 1} · ${match.rule.pattern}`,
      target: match.rule.target,
      name: targetLabel(match.rule.target, lookup),
      winner: match.index,
    };
  return { lead: 'No rule matches · default', target: DIRECT, name: 'Direct', winner: 'default' };
}

export function sampleUrlFor(pattern: string): string {
  return 'https://' + pattern.replace(/^\*\./, 'www.').replace(/\.\*$/, '.com') + '/';
}

export const shouldPrefillTest = (pattern: string) =>
  /^[a-z]/i.test(pattern.replace(/^\*\./, '')) && ruleType(pattern) !== 'regex';
