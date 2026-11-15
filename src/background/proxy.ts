import axios, { AxiosError, isAxiosError } from 'axios';
import { z } from 'zod';

import type { ExitInfo, Mode, SiteRule } from '@/shared/model';

import { LEDGER_SKEW_MS, PROBE, PROBE_HOSTS, STORAGE_KEY, TEST_HOST } from './config';
import {
  domainsFor,
  pacScript,
  ruleRouteSchema,
  serverSchema,
  testPacScript,
  type RuleRoute,
  type Routing,
  type Server,
} from './pac';
import { readSecret, removeSecret, saveSecret } from './vault';

export type { RouteTarget, RuleRoute, Routing, Server } from './pac';

export type TestOutcome =
  { ok: true; ms: number; exit: ExitInfo } | { ok: false; kind: 'auth' | 'timeout' | 'refused' };

const ledgerSchema = z.record(z.object({ hash: z.string(), since: z.number() }));
type Ledger = z.infer<typeof ledgerSchema>;

const appliedSchema = z.object({ proxy: serverSchema, routes: z.array(ruleRouteSchema) });
type Applied = z.infer<typeof appliedSchema>;

const PROXY_AUTH_REQUIRED = 407;
const HASH = 'SHA-256';
const CREDENTIAL_SEPARATOR = '\u0000';

const settingSet = (value: chrome.proxy.ProxyConfig) =>
  new Promise<void>((resolve, reject) =>
    chrome.proxy.settings.set({ value, scope: 'regular' }, () =>
      chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve()
    )
  );

const settingClear = () =>
  new Promise<void>((resolve, reject) =>
    chrome.proxy.settings.clear({ scope: 'regular' }, () =>
      chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve()
    )
  );

const origin = (proxy: Server) => `${proxy.scheme}://${proxy.host.toLowerCase()}:${proxy.port}`;

async function credentialHash(proxy: Server): Promise<string> {
  const digest = await crypto.subtle.digest(
    HASH,
    new TextEncoder().encode(proxy.username + CREDENTIAL_SEPARATOR + proxy.password)
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function readApplication(): Promise<Applied | null> {
  const stored = await chrome.storage.session.get([STORAGE_KEY.proxy, STORAGE_KEY.routes]);
  const live = appliedSchema.safeParse({
    proxy: stored[STORAGE_KEY.proxy],
    routes: stored[STORAGE_KEY.routes] ?? [],
  });
  if (live.success) return live.data;
  const sealed = await readSecret(STORAGE_KEY.applied, appliedSchema);
  if (sealed)
    await chrome.storage.session.set({
      [STORAGE_KEY.proxy]: sealed.proxy,
      [STORAGE_KEY.routes]: sealed.routes,
    });
  return sealed;
}

async function writeApplication(applied: Applied) {
  await chrome.storage.session.set({
    [STORAGE_KEY.proxy]: applied.proxy,
    [STORAGE_KEY.routes]: applied.routes,
  });
  await saveSecret(STORAGE_KEY.applied, applied);
}

export async function readApplied(): Promise<Server | null> {
  return (await readApplication())?.proxy ?? null;
}

async function readRoutes(): Promise<RuleRoute[]> {
  return (await readApplication())?.routes ?? [];
}

async function readLedger(): Promise<Ledger> {
  const stored = await chrome.storage.session.get(STORAGE_KEY.authLedger);
  const parsed = ledgerSchema.safeParse(stored[STORAGE_KEY.authLedger]);
  return parsed.success ? parsed.data : {};
}

async function claimOrigin(proxy: Server) {
  if (!proxy.username) return;
  const key = origin(proxy);
  const hash = await credentialHash(proxy);
  const ledger = await readLedger();
  const seen = ledger[key];
  if (seen?.hash === hash) return;
  if (seen)
    await chrome.browsingData.remove(
      { since: seen.since - LEDGER_SKEW_MS, origins: [key] },
      { cookies: true }
    );
  await chrome.storage.session.set({
    [STORAGE_KEY.authLedger]: { ...ledger, [key]: { hash, since: Date.now() } },
  });
}

const pacConfig = (data: string): chrome.proxy.ProxyConfig => ({
  mode: 'pac_script',
  pacScript: { data, mandatory: true },
});

function configFor(proxy: Server, routing: Routing): chrome.proxy.ProxyConfig {
  if (routing.mode === 'smart') return pacConfig(pacScript(proxy, routing, PROBE_HOSTS));
  return {
    mode: 'fixed_servers',
    rules: {
      singleProxy: { scheme: proxy.scheme, host: proxy.host, port: proxy.port },
      bypassList: [
        '<local>',
        ...domainsFor(routing.siteRules, 'direct').flatMap((domain) => [domain, `*.${domain}`]),
      ],
    },
  };
}

export async function controlConflict(): Promise<boolean> {
  const details = await new Promise<chrome.types.ChromeSettingGetResultDetails>((resolve) =>
    chrome.proxy.settings.get({ incognito: false }, resolve)
  );
  return (
    details.levelOfControl === 'controlled_by_other_extensions' ||
    details.levelOfControl === 'not_controllable'
  );
}

export async function applyProxy(proxy: Server, routing: Routing) {
  await claimOrigin(proxy);
  await writeApplication({ proxy, routes: routing.rules });
  authTried.clear();
  authFailed = false;
  await settingSet(configFor(proxy, routing));
}

export async function reapplyProxy(routing: Routing) {
  const applied = await readApplied();
  if (!applied) return;
  await writeApplication({ proxy: applied, routes: routing.rules });
  await settingSet(configFor(applied, routing));
}

async function idle(mode: Mode) {
  if (mode === 'direct') await settingSet({ mode: 'direct' });
  else if (mode === 'system') await settingSet({ mode: 'system' });
  else await settingClear();
}

export async function releaseProxy(mode: Mode) {
  await chrome.storage.session.remove([STORAGE_KEY.proxy, STORAGE_KEY.routes]);
  await removeSecret(STORAGE_KEY.applied);
  await idle(mode);
}

const authTried = new Set<string>();
const ruleTried = new Set<string>();
let authFailed = false;
let testing: Server | null = null;
const testTried = new Set<string>();
let testAuthFailed = false;

export const authWasRefused = () => authFailed;

const challengedBy = (proxy: Server, challenger: { host: string; port: number }) =>
  proxy.host.toLowerCase() === challenger.host.toLowerCase() && proxy.port === challenger.port;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function answer(
  proxy: Server,
  requestId: string,
  tried: Set<string>,
  onFail: () => void
): chrome.webRequest.BlockingResponse {
  if (!proxy.username || tried.has(requestId)) {
    onFail();
    return { cancel: true };
  }
  tried.add(requestId);
  return { authCredentials: { username: proxy.username, password: proxy.password } };
}

export async function credentialsFor(
  details: chrome.webRequest.WebAuthenticationChallengeDetails,
  onRefused: () => void
): Promise<chrome.webRequest.BlockingResponse> {
  if (!details.isProxy) return {};
  if (testing && challengedBy(testing, details.challenger) && hostOf(details.url) === TEST_HOST) {
    return answer(testing, details.requestId, testTried, () => (testAuthFailed = true));
  }
  const applied = await readApplied();
  if (!applied || !challengedBy(applied, details.challenger)) {
    const ruleServers = (await readRoutes()).flatMap((route) =>
      Array.isArray(route.target) ? route.target : []
    );
    const ruleProxy = ruleServers.find((server) => challengedBy(server, details.challenger));
    return ruleProxy ? answer(ruleProxy, details.requestId, ruleTried, () => undefined) : {};
  }
  return answer(applied, details.requestId, authTried, () => {
    authFailed = true;
    onRefused();
  });
}

const get = (url: string) =>
  axios.get(url, {
    timeout: PROBE.timeoutMs,
    withCredentials: false,
    validateStatus: null,
    fetchOptions: { cache: 'no-store' },
  });

const isOk = (status: number) => status >= 200 && status < 300;

const ipinfoSchema = z.object({
  ip: z.string(),
  country: z.string().optional(),
  city: z.string().optional(),
  org: z.string().optional(),
  timezone: z.string().optional(),
  loc: z.string().optional(),
});

const countryIsSchema = z.object({ ip: z.string(), country: z.string().optional() });

function parseIpinfo(json: z.infer<typeof ipinfoSchema>): ExitInfo {
  const org = json.org ?? '';
  const asn = /^(AS\d+)\s+(.*)$/.exec(org);
  const loc = (json.loc ?? '').split(',').map(Number);
  return {
    ip: json.ip,
    cc: json.country ? json.country.toLowerCase() : null,
    city: json.city || null,
    isp: asn ? asn[2] : org || null,
    asn: asn ? asn[1] : null,
    tz: json.timezone || null,
    loc: loc.length === 2 && loc.every(Number.isFinite) ? [loc[0], loc[1]] : null,
  };
}

const exitFromCountryIs = (json: z.infer<typeof countryIsSchema>): ExitInfo => ({
  ip: json.ip,
  cc: json.country ? json.country.toLowerCase() : null,
  city: null,
  isp: null,
  asn: null,
  tz: null,
  loc: null,
});

type ProbeResult = { ok: false } | { ok: true; exit: ExitInfo | null };

async function probeVia<T>(
  url: string,
  schema: z.ZodType<T>,
  toExit: (json: T) => ExitInfo
): Promise<ProbeResult | null> {
  const res = await get(url).catch(() => null);
  if (!res) return null;
  if (res.status === PROXY_AUTH_REQUIRED) return { ok: false };
  const json = isOk(res.status) ? schema.safeParse(res.data) : null;
  return { ok: true, exit: json?.success ? toExit(json.data) : null };
}

export async function probe(ipv6 = false): Promise<ProbeResult> {
  return (
    (ipv6 ? await probeVia(PROBE.ipv6Url, ipinfoSchema, parseIpinfo) : null) ??
    (await probeVia(PROBE.ipUrl, ipinfoSchema, parseIpinfo)) ??
    (await probeVia(PROBE.fallbackIpUrl, countryIsSchema, exitFromCountryIs)) ?? { ok: false }
  );
}

export async function ping(): Promise<number | null> {
  const start = performance.now();
  const res = await get(PROBE.pingUrl).catch(() => null);
  return res ? Math.max(1, Math.round(performance.now() - start)) : null;
}

async function fetchTestExit(): Promise<TestOutcome> {
  const start = performance.now();
  try {
    const res = await get(PROBE.testUrl);
    if (testAuthFailed || res.status === PROXY_AUTH_REQUIRED) return { ok: false, kind: 'auth' };
    const json = countryIsSchema.safeParse(res.data);
    if (!isOk(res.status) || !json.success) return { ok: false, kind: 'refused' };
    return {
      ok: true,
      ms: Math.max(1, Math.round(performance.now() - start)),
      exit: exitFromCountryIs(json.data),
    };
  } catch (error) {
    if (testAuthFailed) return { ok: false, kind: 'auth' };
    return {
      ok: false,
      kind: isAxiosError(error) && error.code === AxiosError.ETIMEDOUT ? 'timeout' : 'refused',
    };
  }
}

export async function testThrough(
  server: Server,
  mode: Mode,
  siteRules: Record<string, SiteRule>
): Promise<TestOutcome> {
  const applied = await readApplied();
  const routing: Routing = { mode, siteRules, rules: await readRoutes() };
  testing = server;
  testTried.clear();
  testAuthFailed = false;
  try {
    await claimOrigin(server);
    await settingSet(pacConfig(testPacScript(server, TEST_HOST, applied, routing, PROBE_HOSTS)));
    return await fetchTestExit();
  } finally {
    testing = null;
    if (applied) {
      await claimOrigin(applied);
      await settingSet(configFor(applied, routing));
    } else await idle(mode);
  }
}
