import { TOAST_BAD } from '@/shared/config';
import { connectViaPlan } from '@/shared/lib/plans';
import type { Account, Plan, SignIn } from '@/shared/model';

import { clearApiKey, hasApiKey, saveApiKey } from './api/apiKey';
import { ApiError, fetchKeyPermissions, fetchMe, fetchPlans } from './api/flashproxy';
import { API_CODE, API_KEY_PREFIX, PROXIES_PERMISSION, STALE_ACCOUNT_MS } from './config';
import { connect } from './connection';
import {
  isListedPlan,
  readLocationCache,
  resolvePlan,
  saveLocationCache,
  toPlan,
  type LocationCache,
} from './plans';
import { commit, current, setSettings, toast } from './store';

const INITIALS_FALLBACK = '?';

function toAccount(me: { email: string | null; name: string | null }): Account {
  const name = me.name ?? me.email?.split('@')[0] ?? '';
  const words = name.split(/[\s._-]+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
  return { email: me.email ?? '', name, initials: initials || INITIALS_FALLBACK };
}

const errorLabel = (error: unknown) =>
  error instanceof ApiError ? error.label : error instanceof Error ? error.message : String(error);

const signedOut = (error: unknown) => error instanceof ApiError && error.code === API_CODE.unauthorized;

const KEY_ERROR = {
  format: 'That isn’t a FlashProxy API key. Copy it from Settings → API on flashproxy.com.',
  invalid: 'That API key doesn’t work. It may have been revoked; create a new one in Settings → API.',
  proxies: 'This key can’t create proxies. Create a key with the Proxies permission in Settings → API.',
} as const;

async function checkKey(key: string) {
  if (!key.startsWith(API_KEY_PREFIX)) throw new Error(KEY_ERROR.format);
  let permissions: string[];
  try {
    permissions = await fetchKeyPermissions(key);
  } catch (error) {
    if (signedOut(error)) throw new Error(KEY_ERROR.invalid);
    throw new Error('Couldn’t reach FlashProxy · ' + errorLabel(error));
  }
  if (!permissions.includes(PROXIES_PERMISSION)) throw new Error(KEY_ERROR.proxies);
}

async function loadAccount(onProgress?: (email: string, plans: Plan[], step: number) => void) {
  const [me, list, cache] = await Promise.all([fetchMe(), fetchPlans(), readLocationCache()]);
  const account = toAccount(me);
  const listed = list.filter(isListedPlan);
  const previous = new Map(current().plans.map((plan) => [plan.id, plan]));
  const resolved = new Map<string, Plan | null>();
  const report = () => {
    const done = listed.flatMap((apiPlan) => resolved.get(apiPlan.plan_id) ?? []);
    const pending = listed
      .filter((apiPlan) => !resolved.has(apiPlan.plan_id))
      .map((apiPlan) => toPlan(apiPlan, previous.get(apiPlan.plan_id)));
    onProgress?.(account.email, [...done, ...pending], done.length);
  };
  report();
  const nextCache: LocationCache = {};
  await Promise.all(
    listed.map(async (apiPlan) => {
      const { plan, entry } = await resolvePlan(
        apiPlan,
        previous.get(apiPlan.plan_id),
        cache[apiPlan.plan_id]
      );
      resolved.set(apiPlan.plan_id, plan);
      if (entry) nextCache[apiPlan.plan_id] = entry;
      report();
    })
  );
  await saveLocationCache(nextCache);
  return { account, plans: listed.flatMap((apiPlan) => resolved.get(apiPlan.plan_id) ?? []) };
}

function applyAccount(account: Account, plans: Plan[]) {
  const { settings } = current();
  const active = settings.active;
  const stale = active?.kind === 'fp' && !plans.some((plan) => plan.id === active.planId);
  commit({ account, plans });
  const next = connectViaPlan({ settings: current().settings, plans, account });
  if (!active || stale) {
    setSettings({ active: next ? { kind: 'fp', planId: next.id } : null, lastPlanId: next?.id ?? null });
  }
}

function clearAccount() {
  const { settings } = current();
  commit({
    account: null,
    plans: [],
    settings: { ...settings, lastPlanId: null, active: settings.active?.kind === 'fp' ? null : settings.active },
  });
}

let flow = 0;

/** Opens the popup's API key screen. */
export function openSignIn(connectAfter: boolean) {
  flow++;
  commit({}, { signin: { stage: 'enter', connectAfter, email: null, plans: [], step: 0 } });
}

/**
 * Checks and saves an API key, then loads the account. Throws a message the
 * key form shows; nothing is saved when it throws.
 */
export async function setApiKey(raw: string) {
  const key = raw.trim();
  const id = ++flow;
  const live = () => id === flow;
  const connectAfter = current().runtime.signin?.connectAfter ?? false;
  await checkKey(key);
  if (!live()) return;
  await saveApiKey(key);
  const base: SignIn = { stage: 'load', connectAfter, email: null, plans: [], step: 0 };
  commit({}, { signin: base });
  try {
    const { account, plans } = await loadAccount((email, list, step) => {
      if (live()) commit({}, { signin: { ...base, email, plans: list, step } });
    });
    if (!live()) return;
    applyAccount(account, plans);
    commit({}, { signin: null });
    lastRefreshAt = Date.now();
    if (connectAfter) await connect();
  } catch (error) {
    if (!live()) return;
    await clearApiKey();
    commit({}, { signin: { ...base, stage: 'enter' } });
    throw new Error('Couldn’t load your plans · ' + errorLabel(error));
  }
}

export function closeSignIn() {
  flow++;
  commit({}, { signin: null });
}

export async function signOut() {
  flow++;
  await clearApiKey();
  clearAccount();
  commit({}, { signin: null });
}

let lastRefreshAt = 0;
let refreshing: Promise<void> | null = null;

export function refreshAccount(userInitiated = false): Promise<void> {
  refreshing ??= loadAndApply(userInitiated).finally(() => (refreshing = null));
  return refreshing;
}

export async function refreshIfStale() {
  if (Date.now() - lastRefreshAt >= STALE_ACCOUNT_MS) await refreshAccount();
}

async function loadAndApply(userInitiated: boolean) {
  if (current().runtime.signin) return;
  lastRefreshAt = Date.now();
  if (!(await hasApiKey())) {
    if (current().account) clearAccount();
    return;
  }
  try {
    const { account, plans } = await loadAccount();
    applyAccount(account, plans);
  } catch (error) {
    if (signedOut(error)) {
      await clearApiKey();
      clearAccount();
      toast({ text: 'Your FlashProxy API key stopped working. Add a new one.', icon: 'log-out', color: TOAST_BAD });
    } else if (userInitiated) {
      toast({ text: 'Couldn’t reach FlashProxy · ' + errorLabel(error), icon: 'wifi-off', color: TOAST_BAD });
    }
  }
}
