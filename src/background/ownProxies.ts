import {
  AUTO_PROVIDER_ID,
  CUSTOM_PROVIDER,
  DEFAULT_POOL_NAME,
  IMPORT_TAG,
  PORT_RANGE,
} from '@/shared/config';
import { SWATCHES, detectProvider, isValidHost } from '@/shared/lib/ownProxies';
import type {
  Credentials,
  Endpoint,
  OwnProxy,
  PoolStrategy,
  Protocol,
  Provider,
  ProxyDraft,
  Rule,
} from '@/shared/model';

import { UNDO_PURGE_MS, USER_HINT } from './config';
import { commit, current, setSettings } from './store';
import { readCredentials, removeCredentials, saveCredentials } from './vault';

import type { Server } from './proxy';

type ImportItem = { protocol: Protocol; host: string; port: number; username: string; password: string };

interface Trashed {
  proxy: OwnProxy;
  provider: Provider;
  index: number;
  rules: [number, Rule][];
}

const trash = new Map<string, Trashed>();

const insertAt = <T>(list: T[], index: number, item: T) => [...list.slice(0, index), item, ...list.slice(index)];

const findProxy = (id: string) => current().ownProxies.find((proxy) => proxy.id === id);

export function activeOwn(): OwnProxy | undefined {
  const active = current().settings.active;
  return active?.kind === 'own' ? findProxy(active.proxyId) : undefined;
}

const userHint = (username: string) =>
  username.length > USER_HINT.hidden ? username.slice(0, Math.min(USER_HINT.max, username.length - USER_HINT.hidden)) : null;

const newProvider = (name: string, color: string, domain: string | null): Provider => ({
  id: crypto.randomUUID(),
  name,
  initial: name[0].toUpperCase(),
  color,
  domain,
});

function providerFor(providers: Provider[], host: string, providerId: string | null, newName?: string | null): Provider {
  const byName = (name: string) => providers.find((provider) => provider.name.toLowerCase() === name.toLowerCase());
  const detected = detectProvider(host);
  const name = newName?.trim();
  if (name) {
    const matches = detected?.name === name;
    return byName(name) ?? newProvider(name, matches ? detected.color : SWATCHES[providers.length % SWATCHES.length], matches ? detected.domain : null);
  }
  const chosen = providers.find((provider) => provider.id === providerId);
  if (chosen) return chosen;
  const detectedName = detected?.name ?? CUSTOM_PROVIDER.name;
  return byName(detectedName) ?? newProvider(detectedName, detected?.color ?? CUSTOM_PROVIDER.color, detected?.domain ?? null);
}

const withProvider = (providers: Provider[], provider: Provider) =>
  providers.some((item) => item.id === provider.id) ? providers : [...providers, provider];

const usedProviders = (providers: Provider[], proxies: OwnProxy[]) =>
  providers.filter((provider) => proxies.some((proxy) => proxy.providerId === provider.id));

function saveLibrary(ownProxies: OwnProxy[], providers: Provider[] = current().providers) {
  commit({ ownProxies, providers: usedProviders(providers, ownProxies) });
}

function patchProxy(id: string, patch: Partial<OwnProxy>) {
  saveLibrary(current().ownProxies.map((proxy) => (proxy.id === id ? { ...proxy, ...patch } : proxy)));
}

function normalizeDraft(draft: ProxyDraft): ProxyDraft {
  const endpoints = draft.endpoints
    .map((endpoint) => ({ host: endpoint.host.trim().toLowerCase(), port: Number(endpoint.port) }))
    .filter(
      (endpoint) =>
        isValidHost(endpoint.host) &&
        endpoint.port >= PORT_RANGE.min &&
        endpoint.port <= PORT_RANGE.max
    );
  if (!endpoints.length) throw new Error('Add a host and a valid port first');
  return { ...draft, endpoints };
}

const storeCredentials = (id: string, username: string, password: string) =>
  username ? saveCredentials(id, { username, password }) : removeCredentials(id);

function freshProxy(provider: Provider, label: string, protocol: Protocol, endpoints: Endpoint[], username: string, tags: string[]): OwnProxy {
  return {
    id: crypto.randomUUID(),
    providerId: provider.id,
    label,
    protocol,
    endpoints,
    strategy: 'round',
    hasAuth: !!username,
    userHint: userHint(username),
    tags,
    cc: null,
    latency: null,
    healthy: true,
    failCount: 0,
    error: null,
    checkedAt: null,
  };
}

export async function addProxy(input: ProxyDraft): Promise<OwnProxy> {
  const draft = normalizeDraft(input);
  const first = draft.endpoints[0];
  const provider = providerFor(current().providers, first.host, draft.providerId, draft.newProvider);
  const label = draft.label.trim() || (draft.endpoints.length > 1 ? 'Pool · ' + first.host : first.host);
  const proxy = { ...freshProxy(provider, label, draft.protocol, draft.endpoints, draft.username, draft.tags), strategy: draft.strategy };
  await storeCredentials(proxy.id, draft.username, draft.password);
  saveLibrary([...current().ownProxies, proxy], withProvider(current().providers, provider));
  return proxy;
}

export async function updateProxy(id: string, input: ProxyDraft): Promise<OwnProxy> {
  const existing = findProxy(id);
  if (!existing) throw new Error('Proxy not found');
  const draft = normalizeDraft(input);
  const provider = providerFor(current().providers, draft.endpoints[0].host, draft.providerId, draft.newProvider);
  const sameEndpoints =
    JSON.stringify(existing.endpoints.map(({ host, port }) => [host, port])) === JSON.stringify(draft.endpoints.map(({ host, port }) => [host, port]));
  const proxy: OwnProxy = {
    ...existing,
    providerId: provider.id,
    label: draft.label.trim() || existing.label,
    protocol: draft.protocol,
    endpoints: sameEndpoints ? existing.endpoints : draft.endpoints,
    strategy: draft.strategy,
    hasAuth: !!draft.username,
    userHint: userHint(draft.username),
    tags: draft.tags,
  };
  await storeCredentials(id, draft.username, draft.password);
  saveLibrary(
    current().ownProxies.map((item) => (item.id === id ? proxy : item)),
    withProvider(current().providers, provider)
  );
  return proxy;
}

export async function duplicateProxy(id: string): Promise<void> {
  const proxies = current().ownProxies;
  const index = proxies.findIndex((proxy) => proxy.id === id);
  if (index < 0) return;
  const source = proxies[index];
  const copy: OwnProxy = { ...structuredClone(source), id: crypto.randomUUID(), label: source.label + ' (copy)' };
  const credentials = source.hasAuth ? await readCredentials(source.id) : null;
  if (credentials) await saveCredentials(copy.id, credentials);
  saveLibrary(insertAt(proxies, index + 1, copy));
}

export function moveProxy(id: string, providerId: string) {
  if (!current().providers.some((provider) => provider.id === providerId)) return;
  patchProxy(id, { providerId });
}

export function setStrategy(id: string, strategy: PoolStrategy) {
  patchProxy(id, { strategy });
}

export function deleteProxy(id: string): string {
  const { ownProxies, providers, rules, settings } = current();
  const index = ownProxies.findIndex((proxy) => proxy.id === id);
  if (index < 0) throw new Error('Proxy not found');
  const proxy = ownProxies[index];
  const usesIt = (rule: Rule) => rule.target.kind === 'own' && rule.target.proxyId === id;
  const token = crypto.randomUUID();
  trash.set(token, {
    proxy,
    provider: providers.find((provider) => provider.id === proxy.providerId)!,
    index,
    rules: rules.flatMap((rule, position): [number, Rule][] => (usesIt(rule) ? [[position, rule]] : [])),
  });
  setTimeout(() => {
    if (trash.delete(token) && !findProxy(id)) void removeCredentials(id);
  }, UNDO_PURGE_MS);
  const remaining = ownProxies.filter((item) => item.id !== id);
  commit({ ownProxies: remaining, providers: usedProviders(providers, remaining), rules: rules.filter((rule) => !usesIt(rule)) });
  if (settings.active?.kind === 'own' && settings.active.proxyId === id) setSettings({ active: null });
  return token;
}

export function undoDelete(token: string) {
  const trashed = trash.get(token);
  if (!trashed) return;
  trash.delete(token);
  const { ownProxies, providers, rules } = current();
  let restoredRules = rules;
  for (const [position, rule] of trashed.rules) {
    if (!restoredRules.some((item) => item.id === rule.id)) restoredRules = insertAt(restoredRules, position, rule);
  }
  commit({
    ownProxies: insertAt(ownProxies, trashed.index, trashed.proxy),
    providers: withProvider(providers, trashed.provider),
    rules: restoredRules,
  });
}

export function renameProvider(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  commit({ providers: current().providers.map((provider) => (provider.id === id ? { ...provider, name: trimmed, initial: trimmed[0].toUpperCase() } : provider)) });
}

export function setProviderColor(id: string, color: string) {
  commit({ providers: current().providers.map((provider) => (provider.id === id ? { ...provider, color } : provider)) });
}

export const getCredentials = (id: string): Promise<Credentials | null> => readCredentials(id);

export async function importProxies(
  items: ImportItem[],
  mode: 'separate' | 'pool',
  providerId: string,
  poolName: string
): Promise<number> {
  if (items.some((item) => !isValidHost(item.host)))
    throw new Error('One of the hosts isn’t a valid hostname or IP');
  if (!items.length) return 0;
  let providers = current().providers;
  const pick = (host: string) => {
    const provider = providerFor(providers, host, providerId === AUTO_PROVIDER_ID ? null : providerId);
    providers = withProvider(providers, provider);
    return provider;
  };
  const created: [OwnProxy, ImportItem][] = [];
  if (mode === 'pool') {
    const first = items[0];
    const endpoints = items.map(({ host, port }) => ({ host, port }));
    created.push([freshProxy(pick(first.host), poolName.trim() || DEFAULT_POOL_NAME, first.protocol, endpoints, first.username, [IMPORT_TAG]), first]);
  } else {
    for (const item of items) {
      const provider = pick(item.host);
      const label = `${provider.name === CUSTOM_PROVIDER.name ? item.host : provider.name} · ${item.port}`;
      created.push([freshProxy(provider, label, item.protocol, [{ host: item.host, port: item.port }], item.username, [IMPORT_TAG]), item]);
    }
  }
  for (const [proxy, item] of created) await storeCredentials(proxy.id, item.username, item.password);
  saveLibrary([...current().ownProxies, ...created.map(([proxy]) => proxy)], providers);
  return items.length;
}

export function pickEndpoint(proxy: OwnProxy, poolIdx: number): number {
  const count = proxy.endpoints.length;
  if (count < 2) return 0;
  switch (proxy.strategy) {
    case 'round':
      return (poolIdx + 1) % count;
    case 'random':
      return Math.floor(Math.random() * count);
    case 'latency': {
      const ranked = proxy.endpoints
        .map((endpoint, index) => ({ index, latency: endpoint.healthy === false ? null : (endpoint.latency ?? null) }))
        .filter((item): item is { index: number; latency: number } => item.latency !== null)
        .sort((a, b) => a.latency - b.latency);
      return ranked[0]?.index ?? poolIdx % count;
    }
    case 'failover': {
      const healthy = proxy.endpoints.findIndex((endpoint) => endpoint.healthy !== false);
      return Math.max(0, healthy);
    }
  }
}

const SCHEME: Readonly<Record<Protocol, Server['scheme']>> = { HTTP: 'http', HTTPS: 'https', SOCKS4: 'socks4', SOCKS5: 'socks5' };

export const toServer = (protocol: Protocol, endpoint: { host: string; port: number }, credentials: Credentials | null): Server => ({
  scheme: SCHEME[protocol],
  host: endpoint.host,
  port: endpoint.port,
  username: credentials?.username ?? '',
  password: credentials?.password ?? '',
});

export async function serverFor(proxy: OwnProxy, endpoint: { host: string; port: number }): Promise<Server> {
  const credentials = proxy.hasAuth ? await readCredentials(proxy.id) : null;
  if (proxy.hasAuth && !credentials) throw new Error('Couldn’t read the saved login. Edit the proxy and enter it again.');
  return toServer(proxy.protocol, endpoint, credentials);
}

export interface Health {
  healthy: boolean;
  cc: string | null;
  latency: number | null;
  error: string | null;
}

export function recordHealth(id: string, overall: Health, byEndpoint: ReadonlyMap<number, Health>) {
  const proxy = findProxy(id);
  if (!proxy) return;
  const endpoints = proxy.endpoints.map((endpoint, index) => {
    const health = byEndpoint.get(index);
    return health ? { ...endpoint, healthy: health.healthy, latency: health.latency, cc: health.cc ?? endpoint.cc ?? null } : endpoint;
  });
  patchProxy(id, {
    endpoints,
    healthy: overall.healthy,
    failCount: overall.healthy ? 0 : proxy.failCount + 1,
    latency: overall.latency,
    error: overall.error,
    cc: overall.cc ?? proxy.cc,
    checkedAt: Date.now(),
  });
}
