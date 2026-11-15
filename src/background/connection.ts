import { ERROR_STATES, STICKY_SECONDS, TOAST_BAD, TOAST_INFO, TOAST_OK } from '@/shared/config';
import { countryName } from '@/shared/lib/countries';
import type { Mode, Plan, Runtime, Status, Toast } from '@/shared/model';

import { refreshAccount } from './account';
import { fetchProxy } from './api/flashproxy';
import {
  BADGE_COLOR,
  BADGE_TEXT,
  HEALTH_ALARM,
  HEALTH_FAILS,
  HEALTH_MINUTES,
  STICKY_ALARM,
} from './config';
import { activeOwn, pickEndpoint, recordHealth, serverFor } from './ownProxies';
import { validLocation } from './plans';
import {
  applyProxy,
  authWasRefused,
  controlConflict,
  ping,
  probe,
  readApplied,
  reapplyProxy,
  releaseProxy,
  type Server,
} from './proxy';
import { forgetRuleServers, routingFor } from './routes';
import { commit, current, setRuntime, setSettings, toast } from './store';

const LIVE_STATES: readonly Status[] = ['on', 'rotating', 'connecting'];
const STICKY_MINUTES = STICKY_SECONDS / 60;

interface ConnectOpts {
  transition?: 'connecting' | 'rotating';
  toast?: Toast;
  quiet?: boolean;
  poolIdx?: number;
}

let op = 0;
let healthFails = 0;

export const isLive = () => LIVE_STATES.includes(current().runtime.status);

const isFp = () => current().settings.active?.kind === 'fp';

function activePlan(): Plan | undefined {
  const { settings, plans, account } = current();
  const active = settings.active;
  if (!account || active?.kind !== 'fp') return undefined;
  return plans.find((plan) => plan.id === active.planId);
}

function rememberGateway(planId: string, { scheme, host, port }: Plan['gateway']) {
  const plans = current().plans;
  const gateway = { scheme, host, port };
  const known = plans.find((plan) => plan.id === planId)?.gateway;
  if (known && known.host === host && known.port === port && known.scheme === scheme) return;
  commit({ plans: plans.map((plan) => (plan.id === planId ? { ...plan, gateway } : plan)) });
}

const needsFreshPlan = (plan: Plan | undefined) => !plan || blocker(plan) !== null;

function blocker(plan: Plan): Status | null {
  if (plan.status === 'expired') return 'expired';
  if (plan.gbLeft !== null && plan.gbLeft <= 0) return 'bw';
  return null;
}

function badge(status: Status) {
  const { settings, runtime } = current();
  if (status === 'on') {
    const text =
      settings.mode === 'smart'
        ? BADGE_TEXT.smart
        : (runtime.exit?.cc ?? BADGE_TEXT.on).toUpperCase();
    return { text, color: BADGE_COLOR.brand };
  }
  if (status === 'connecting') return { text: BADGE_TEXT.connecting, color: BADGE_COLOR.brand };
  if (status === 'rotating') return { text: BADGE_TEXT.rotating, color: BADGE_COLOR.brand };
  if (status === 'bw') return { text: BADGE_TEXT.noData, color: BADGE_COLOR.warn };
  if (status === 'conflict') return { text: BADGE_TEXT.alert, color: BADGE_COLOR.warn };
  if (ERROR_STATES.includes(status)) return { text: BADGE_TEXT.alert, color: BADGE_COLOR.error };
  if (settings.mode === 'direct') return { text: BADGE_TEXT.direct, color: BADGE_COLOR.brand };
  return { text: BADGE_TEXT.off, color: BADGE_COLOR.brand };
}

function set(patch: Partial<Runtime>) {
  setRuntime(patch);
  const { text, color } = badge(current().runtime.status);
  void chrome.action.setBadgeBackgroundColor({ color });
  void chrome.action.setBadgeTextColor({ color: BADGE_COLOR.text });
  void chrome.action.setBadgeText({ text });
}

function startTimers(stickyUntil: number | null) {
  if (stickyUntil) void chrome.alarms.create(STICKY_ALARM, { when: stickyUntil });
  else void chrome.alarms.clear(STICKY_ALARM);
  void chrome.alarms.create(HEALTH_ALARM, { periodInMinutes: HEALTH_MINUTES });
}

function stopTimers() {
  void chrome.alarms.clear(STICKY_ALARM);
  void chrome.alarms.clear(HEALTH_ALARM);
}

const placeLabel = () => activeOwn()?.label ?? countryName(current().settings.location.cc);

function markOwn(healthy: boolean, latency: number | null = null, cc: string | null = null) {
  const own = activeOwn();
  if (!own) return;
  const health = { healthy, cc, latency, error: healthy ? null : 'No answer' };
  recordHealth(own.id, health, new Map([[current().runtime.poolIdx, health]]));
}

async function fail(status: Status) {
  if (status === 'ownfail') markOwn(false);
  await halt(status);
}

async function halt(status: Status, patch: Partial<Runtime> = {}) {
  stopTimers();
  await releaseProxy(current().settings.mode).catch(() => undefined);
  set({ status, latency: null, sessionExpiresAt: null, ...patch });
}

export async function connect(opts: ConnectOpts = {}): Promise<void> {
  const id = ++op;
  const live = () => id === op;
  const { settings, account } = current();
  const own = activeOwn();
  if (!own && !account) return;
  const mode: Mode =
    settings.mode === 'direct' || settings.mode === 'system' ? 'global' : settings.mode;
  setSettings({ mode, wantOn: true });
  if (!own && needsFreshPlan(activePlan())) {
    set({ status: opts.transition ?? 'connecting', conflictName: null });
    await refreshAccount();
    if (!live()) return;
  }
  const plan = own ? undefined : activePlan();
  if (plan) setSettings({ lastPlanId: plan.id });

  if (!own && !plan) return halt('noplans');
  const blocked = plan && blocker(plan);
  if (blocked) return halt(blocked);

  const location = plan
    ? validLocation(plan, current().settings.location)
    : current().settings.location;
  if (location !== current().settings.location) setSettings({ location });
  const session = current().settings.session;
  const poolIdx = own ? (opts.poolIdx ?? pickEndpoint(own, current().runtime.poolIdx)) : 0;
  set({ status: opts.transition ?? 'connecting', conflictName: null, poolIdx });
  const failed = (): Status => (authWasRefused() ? 'auth' : own ? 'ownfail' : 'unreach');

  let proxy: Server;
  try {
    proxy = own
      ? await serverFor(own, own.endpoints[poolIdx])
      : await fetchProxy(plan!.id, {
          cc: location.cc,
          session,
          stickyMinutes: STICKY_MINUTES,
        }).then((fp) => {
          rememberGateway(plan!.id, fp);
          return fp;
        });
  } catch (error) {
    if (!live()) return;
    const label = error instanceof Error ? error.message : String(error);
    toast({ text: 'Couldn’t get a proxy · ' + label, icon: 'wifi-off', color: TOAST_BAD });
    return fail(own ? 'ownfail' : 'unreach');
  }
  if (!live()) return;

  forgetRuleServers();
  const routing = await routingFor(proxy);
  if (!live()) return;
  await applyProxy(proxy, routing);
  if (!live()) return;
  if (await controlConflict()) {
    stopTimers();
    set({ status: 'conflict', conflictName: null });
    return;
  }

  const result = await probe(plan?.ipv6 ?? false);
  if (!live()) return;
  if (!result.ok) return fail(failed());

  const latency = await ping();
  if (!live()) return;
  healthFails = 0;
  const sessionExpiresAt = plan && session === 'sticky' ? Date.now() + STICKY_SECONDS * 1000 : null;
  set({ status: 'on', exit: result.exit, latency, sessionExpiresAt });
  markOwn(true, latency, result.exit?.cc ?? null);
  startTimers(sessionExpiresAt);
  if (!opts.quiet)
    toast(opts.toast ?? { text: 'Connected · ' + placeLabel(), icon: 'check', color: TOAST_OK });
}

export async function disconnect(mode?: Mode): Promise<void> {
  const id = ++op;
  setSettings({ wantOn: false, ...(mode ? { mode } : {}) });
  stopTimers();
  await releaseProxy(current().settings.mode).catch(() => undefined);
  set({ status: 'off', latency: null, sessionExpiresAt: null, conflictName: null });
  if (current().settings.mode === 'system') return;
  const result = await probe();
  if (id === op && result.ok && result.exit) set({ realIp: result.exit.ip });
}

export function toggle() {
  const { runtime, settings } = current();
  if (isLive() || (settings.wantOn && ERROR_STATES.includes(runtime.status))) return disconnect();
  return connect();
}

export async function setMode(mode: Mode) {
  if (mode === 'direct' || mode === 'system') return disconnect(mode);
  setSettings({ mode });
  if (current().runtime.status === 'on') return reroute();
  if (isLive()) return connect({ transition: 'rotating', quiet: true });
}

export async function reroute() {
  if (current().runtime.status !== 'on') return;
  const applied = await readApplied();
  if (applied) await reapplyProxy(await routingFor(applied));
}

export async function rotate(auto = false) {
  if (current().runtime.status !== 'on' || !isFp()) return;
  return connect({
    transition: 'rotating',
    toast: {
      text: auto ? 'Sticky session ended · new IP' : 'IP rotated',
      icon: 'refresh-cw',
      color: TOAST_INFO,
    },
  });
}

export async function nextProxy() {
  const own = activeOwn();
  if (current().runtime.status !== 'on' || !own || own.endpoints.length < 2) return;
  return connect({
    transition: 'rotating',
    poolIdx: (current().runtime.poolIdx + 1) % own.endpoints.length,
    toast: { text: 'Next proxy in pool', icon: 'skip-forward', color: TOAST_INFO },
  });
}

export async function reconnectIfLive(opts: ConnectOpts = { transition: 'rotating', quiet: true }) {
  if (isLive() || current().runtime.status === 'conflict') return connect(opts);
}

export async function onRefused() {
  if (current().runtime.status !== 'on') return;
  op++;
  await halt('auth');
}

export async function onSessionEnd() {
  if (current().settings.session === 'sticky') return rotate(true);
}

export async function onHealthTick() {
  if (current().runtime.status !== 'on') return;
  const id = op;
  const latency = await ping();
  if (id !== op || current().runtime.status !== 'on') return;
  if (latency !== null) {
    healthFails = 0;
    set({ latency });
    return;
  }
  if (++healthFails >= HEALTH_FAILS) {
    op++;
    await fail(activeOwn() ? 'ownfail' : 'unreach');
  }
}

export async function restore() {
  if (current().settings.wantOn) return connect({ quiet: true });
  set({ status: 'off' });
}
