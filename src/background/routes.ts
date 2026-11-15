import { STICKY_SECONDS } from '@/shared/config';
import type { RuleTarget } from '@/shared/model';

import { fetchProxy } from './api/flashproxy';
import { activeOwn, serverFor } from './ownProxies';
import { validLocation } from './plans';
import { current } from './store';

import type { RouteTarget, Routing, Server } from './proxy';

const planServers = new Map<string, Promise<Server>>();

export const forgetRuleServers = () => planServers.clear();

function planServer(planId: string): Promise<Server> {
  const cached = planServers.get(planId);
  if (cached) return cached;
  const { plans, account, settings } = current();
  const plan = plans.find((item) => item.id === planId);
  if (!account || !plan) return Promise.reject(new Error('Plan unavailable'));
  const request = fetchProxy(plan.id, {
    cc: validLocation(plan, settings.location).cc,
    session: settings.session,
    stickyMinutes: STICKY_SECONDS / 60,
  });
  planServers.set(planId, request);
  request.catch(() => planServers.delete(planId));
  return request;
}

async function resolve(target: RuleTarget, active: Server): Promise<RouteTarget> {
  const source = current().settings.active;
  if (target.kind === 'direct' || target.kind === 'block') return target.kind;
  if (target.kind === 'fp') {
    if (source?.kind === 'fp' && source.planId === target.planId) return [active];
    return [await planServer(target.planId)];
  }
  if (activeOwn()?.id === target.proxyId) return [active];
  const proxy = current().ownProxies.find((item) => item.id === target.proxyId);
  if (!proxy) return 'block';
  return Promise.all(proxy.endpoints.map((endpoint) => serverFor(proxy, endpoint)));
}

export async function routingFor(active: Server): Promise<Routing> {
  const { settings, rules } = current();
  const enabled = settings.mode === 'smart' ? rules.filter((rule) => rule.enabled) : [];
  const routes = await Promise.all(
    enabled.map(async ({ type, pattern, target }) => ({
      type,
      pattern,
      target: await resolve(target, active).catch((): RouteTarget => 'block'),
    }))
  );
  return { mode: settings.mode, siteRules: settings.siteRules, rules: routes };
}
