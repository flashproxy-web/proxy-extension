import { fpProfileName, planIsDead, type Model } from '@/popup/entities/connection';
import { COLOR } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { latencyColor } from '@/shared/lib/format';
import type { OwnProxy, Plan, Provider } from '@/shared/model';
import type { StatusTone } from '@/shared/ui/StatusDot';

interface ProfileItem {
  id: string;
  name: string;
  subtitle: string;
  tone: StatusTone;
  latency: string;
  latencyColor: string;
  active: boolean;
  pick: () => void;
}

const latencyLabel = (latency: number | null | undefined) =>
  latency != null ? latency + ' ms' : '';

function planProfile(model: Model, plan: Plan): ProfileItem {
  const active = !model.isOwn && model.plan?.id === plan.id;
  const latency = active && model.live ? model.snapshot.runtime.latency : null;
  return {
    id: 'fp:' + plan.id,
    name: fpProfileName(plan),
    subtitle: `${plan.name} · ${plan.gateway.scheme.toUpperCase()}`,
    tone: 'ok',
    latency: latencyLabel(latency),
    latencyColor: latencyColor(latency),
    active,
    pick: () => send({ type: 'pickPlan', planId: plan.id }),
  };
}

function ownProfile(model: Model, proxy: OwnProxy, provider: Provider | undefined): ProfileItem {
  const socks = proxy.protocol === 'SOCKS5';
  const poolSize = proxy.endpoints.length;
  const kind =
    poolSize > 1
      ? `Pool · ${poolSize} proxies`
      : `${provider?.name ?? 'Custom'} · ${socks ? 'IP whitelist' : proxy.protocol}`;
  return {
    id: proxy.id,
    name: proxy.label,
    subtitle: kind + (socks ? ' · SOCKS5 needs IP whitelisting in Chrome' : ''),
    tone: proxy.healthy ? (socks ? 'warn' : 'ok') : 'bad',
    latency: proxy.healthy ? latencyLabel(proxy.latency) : 'down',
    latencyColor: proxy.healthy ? latencyColor(proxy.latency) : COLOR.red,
    active: model.isOwn && model.proxy?.id === proxy.id,
    pick: () => send({ type: 'pickOwn', proxyId: proxy.id }),
  };
}

/** Until the dashboard can save profiles, every live plan and own proxy is a profile. */
export function profiles(model: Model): ProfileItem[] {
  const { snapshot } = model;
  const planProfiles = model.signedIn
    ? snapshot.plans.filter((plan) => !planIsDead(plan)).map((plan) => planProfile(model, plan))
    : [];
  const providers = new Map(snapshot.providers.map((provider) => [provider.id, provider]));
  const ownProfiles = snapshot.ownProxies.map((proxy) =>
    ownProfile(model, proxy, providers.get(proxy.providerId))
  );
  return [...planProfiles, ...ownProfiles];
}
