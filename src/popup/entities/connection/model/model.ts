// Pure derivations from an engine snapshot: which source is active, what to call
// it, and the hero copy for each status. Kept out of the components so the copy
// lives in one place.

import { COLOR } from '@/popup/shared/config';
import { ERROR_STATES } from '@/shared/config';
import { COUNTRY_CODES, countryName } from '@/shared/lib/countries';
import { fmtDay, fmtGb } from '@/shared/lib/format';
import { fpProfileName, planIsDead } from '@/shared/lib/plans';
import type {
  OwnProxy,
  Plan,
  PlanKind,
  Provider,
  RuleTarget,
  Snapshot,
  Status,
} from '@/shared/model';
import type { StatusTone } from '@/shared/ui/StatusDot';

export const PLAN_ICON: Record<PlanKind, string> = {
  res: 'house',
  isp: 'radio',
  dc: 'server',
  mob: 'smartphone',
};

export { fpProfileName, planIsDead };

/** Display name of a rule target: "FP Residential · Auto", a proxy label, Direct or Block. */
export function targetName(
  target: RuleTarget,
  snapshot: Pick<Snapshot, 'plans' | 'ownProxies'>
): string {
  if (target.kind === 'direct') return 'Direct';
  if (target.kind === 'block') return 'Block';
  if (target.kind === 'fp') {
    const plan = snapshot.plans.find((candidate) => candidate.id === target.planId);
    return plan ? fpProfileName(plan) : 'FlashProxy plan';
  }
  return snapshot.ownProxies.find((proxy) => proxy.id === target.proxyId)?.label ?? 'Removed proxy';
}

export function planLeftLabel(plan: Plan): string {
  if (plan.status === 'expired') return 'Expired ' + fmtDay(plan.expiredAt);
  if (plan.gbLeft !== null && plan.gbLeft <= 0) return 'Out of data';
  if (plan.gbLeft !== null) return fmtGb(plan.gbLeft) + ' GB left';
  return plan.renewsAt ? 'Renews ' + fmtDay(plan.renewsAt) : 'Unmetered';
}

/** The chip in the header: "Residential · 42 GB", or the plan's renewal/expiry. */
export function planChipLabel(plan: Plan): string {
  if (plan.status === 'active' && plan.gbLeft !== null) {
    return `${plan.name} · ${fmtGb(plan.gbLeft)} GB`;
  }
  if (plan.status === 'expired') return `${plan.name} · Expired ${fmtDay(plan.expiredAt)}`;
  return `${plan.name} · Renews ${fmtDay(plan.renewsAt)}`;
}

export function proxyLatencyLabel(proxy: OwnProxy): string {
  if (!proxy.healthy) return 'down';
  return proxy.latency != null ? proxy.latency + ' ms' : '—';
}

export function ownProxyMatches(
  proxy: OwnProxy,
  provider: Provider | undefined,
  query: string
): boolean {
  if (!query) return true;
  const hosts = proxy.endpoints.map((endpoint) => endpoint.host).join(' ');
  return `${proxy.label} ${provider?.name ?? ''} ${hosts}`.toLowerCase().includes(query);
}

export function countryPool(snapshot: Pick<Snapshot, 'geo'>, plan: Plan): string[] {
  const codes = plan.countries ?? COUNTRY_CODES;
  const withGeo = Object.keys(snapshot.geo).filter((code) => codes.includes(code));
  const withoutGeo = codes
    .filter((code) => !snapshot.geo[code])
    .sort((first, second) => countryName(first).localeCompare(countryName(second)));
  return [...withGeo, ...withoutGeo];
}

export function filterCountries(codes: string[], query: string): string[] {
  if (!query) return codes;
  return codes.filter((code) => countryName(code).toLowerCase().includes(query) || code === query);
}

export function firstCity(
  snapshot: Pick<Snapshot, 'geo'>,
  plan: Plan | undefined,
  code: string
): string | null {
  return plan?.cityTargeting ? (snapshot.geo[code]?.cities[0] ?? null) : null;
}

export type Model = ReturnType<typeof derive>;

export function derive(snapshot: Snapshot) {
  const status: Status = snapshot.runtime.status;
  const mode = snapshot.settings.mode;
  const on = status === 'on';
  const rotating = status === 'rotating';
  const connecting = status === 'connecting';
  const live = on || rotating || connecting;
  const failed = ERROR_STATES.includes(status);
  const signedIn = !!snapshot.account;
  const hasAny = signedIn || snapshot.ownProxies.length > 0;
  const active = snapshot.settings.active;
  const isOwn = active?.kind === 'own';
  const plan: Plan | undefined =
    active?.kind === 'fp' ? snapshot.plans.find((item) => item.id === active.planId) : undefined;
  const proxy: OwnProxy | undefined =
    active?.kind === 'own'
      ? snapshot.ownProxies.find((item) => item.id === active.proxyId)
      : undefined;
  const provider: Provider | undefined = proxy
    ? snapshot.providers.find((item) => item.id === proxy.providerId)
    : undefined;
  const endpoint = proxy
    ? proxy.endpoints[snapshot.runtime.poolIdx % proxy.endpoints.length]
    : undefined;
  const location = snapshot.settings.location;
  const country = countryName(location.cc);
  const city = plan?.cityTargeting ? location.city : null;
  const placeTitle = city ? `${city}, ${country}` : country;
  const exit = snapshot.runtime.exit;
  const exitTrusted = on || rotating;
  // The last exit info belongs to whatever was connected before, so trust it only while live.
  const exitCc = isOwn ? ((exitTrusted ? exit?.cc : null) ?? proxy?.cc ?? null) : location.cc;
  const exitCountry = exitCc ? countryName(exitCc) : null;
  const liveExit = exitTrusted ? exit : null;
  const fpHost = plan?.gateway.host ? `${plan.gateway.host}:${plan.gateway.port}` : '';
  const ownHost = endpoint ? `${endpoint.host}:${endpoint.port}` : '';
  const host = isOwn ? ownHost : fpHost;
  const fpProfile = plan ? fpProfileName(plan) : 'No profile';
  const profileName = isOwn ? (proxy?.label ?? '') : fpProfile;
  const providerName = provider?.name ?? 'Custom';
  return {
    snapshot,
    status,
    mode,
    on,
    rotating,
    connecting,
    live,
    failed,
    signedIn,
    hasAny,
    isOwn,
    plan,
    proxy,
    provider,
    providerName,
    location,
    country,
    city,
    placeTitle,
    liveExit,
    exitCc,
    exitCountry,
    host,
    profileName,
  };
}

export type HeroAnimation = 'pulse' | 'blink' | 'none';

export interface Hero {
  label: string;
  color: string;
  tone: StatusTone;
  animation: HeroAnimation;
  title: string;
  subtitle: string;
}

function activeRuleCount(snapshot: Snapshot): number {
  const enabledRules = snapshot.rules.filter((rule) => rule.enabled).length;
  return enabledRules + Object.keys(snapshot.settings.siteRules).length;
}

function idleHero(model: Model): Hero {
  const { snapshot, mode } = model;
  if (mode === 'system') {
    return {
      label: 'System',
      color: COLOR.muted2,
      tone: 'idle',
      animation: 'none',
      title: 'Using system proxy',
      subtitle: 'Chrome follows your OS settings',
    };
  }
  const realIp = snapshot.runtime.realIp;
  return {
    label: mode === 'direct' ? 'Direct' : 'Disconnected',
    color: COLOR.muted2,
    tone: 'idle',
    animation: 'none',
    title: 'Not protected',
    subtitle: realIp ? `Your real IP ${realIp} is visible` : 'Your real IP is visible',
  };
}

function statusHero(model: Model): Hero {
  const { snapshot, status, mode, plan } = model;
  switch (status) {
    case 'on': {
      const rules = activeRuleCount(snapshot);
      const smart = mode === 'smart';
      return {
        label: smart ? 'Smart rules' : 'Connected',
        color: COLOR.green,
        tone: 'ok',
        animation: 'pulse',
        title: model.placeTitle,
        subtitle: smart
          ? `${rules} ${rules === 1 ? 'rule' : 'rules'} active · only matched sites use the proxy`
          : 'All browser traffic goes through FlashProxy',
      };
    }
    case 'connecting':
      return {
        label: 'Connecting',
        color: COLOR.accentInk,
        tone: 'busy',
        animation: 'blink',
        title: 'Reaching ' + (model.city ?? model.country),
        subtitle: 'Negotiating with the gateway…',
      };
    case 'rotating':
      return {
        label: 'Rotating IP',
        color: COLOR.accentInk,
        tone: 'busy',
        animation: 'blink',
        title: model.placeTitle,
        subtitle: 'Getting a fresh exit IP…',
      };
    case 'auth':
      return {
        label: 'Auth failed',
        color: COLOR.red,
        tone: 'bad',
        animation: 'none',
        title: 'Connection blocked',
        subtitle: model.profileName,
      };
    case 'unreach':
      return {
        label: 'Unreachable',
        color: COLOR.red,
        tone: 'bad',
        animation: 'none',
        title: 'Proxy not responding',
        subtitle: model.host,
      };
    case 'bw':
      return {
        label: 'No bandwidth',
        color: COLOR.amber,
        tone: 'warn',
        animation: 'none',
        title: 'Plan is out of data',
        subtitle: `${plan?.name ?? 'Plan'} · 0 GB left`,
      };
    case 'conflict':
      return {
        label: 'Paused',
        color: COLOR.amber,
        tone: 'warn',
        animation: 'none',
        title: 'Controlled elsewhere',
        subtitle: 'Another extension owns the proxy setting',
      };
    case 'noplans':
      return {
        label: 'No plans',
        color: COLOR.amber,
        tone: 'warn',
        animation: 'none',
        title: 'Nothing to connect to',
        subtitle: 'Buy a plan or add your own proxies',
      };
    case 'expired':
      return {
        label: 'Plan expired',
        color: COLOR.amber,
        tone: 'warn',
        animation: 'none',
        title: `${plan?.name ?? 'Your'} plan expired`,
        subtitle: `Expired ${fmtDay(plan?.expiredAt)} · renew to reconnect`,
      };
    case 'ownfail':
      return {
        label: 'Health check failed',
        color: COLOR.red,
        tone: 'bad',
        animation: 'none',
        title: `${model.proxy?.label ?? 'Proxy'} is not responding`,
        subtitle: `${model.providerName} · ${model.host}`,
      };
    default:
      return idleHero(model);
  }
}

export function hero(model: Model): Hero {
  const base = statusHero(model);
  const { plan, proxy } = model;
  if (model.isOwn && model.live && proxy) {
    const exitDetail = model.exitCountry ? 'exit in ' + model.exitCountry : model.host;
    return {
      ...base,
      title: model.connecting ? 'Reaching ' + proxy.label : proxy.label,
      subtitle: model.on
        ? `${model.providerName} · ${proxy.protocol} · ${exitDetail}`
        : base.subtitle,
    };
  }
  if (!model.isOwn && plan && !plan.cityTargeting && model.live) {
    return { ...base, title: (model.connecting ? 'Reaching ' : '') + model.country };
  }
  return base;
}
