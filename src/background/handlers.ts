import type { EngineApi, RpcMethod } from '@/shared/api/client';
import { NOT_AVAILABLE } from '@/shared/api/fallback';
import {
  EXT_PAGE,
  FP_LINKS,
  TOAST_OK,
  extensionDetailsUrl,
  CHROME_EXTENSIONS_URL,
} from '@/shared/config';
import { countryName } from '@/shared/lib/countries';
import { connectViaPlan } from '@/shared/lib/plans';
import { ruleType } from '@/shared/lib/routing';
import type { Action, OpenTarget, Rule } from '@/shared/model';

import { closeSignIn, openSignIn, refreshAccount, setApiKey, signOut } from './account';
import {
  connect,
  disconnect,
  isLive,
  nextProxy,
  reconnectIfLive,
  reroute,
  rotate,
  setMode,
  toggle,
} from './connection';
import {
  addProxy,
  deleteProxy,
  duplicateProxy,
  getCredentials,
  importProxies,
  moveProxy,
  renameProvider,
  setProviderColor,
  setStrategy,
  undoDelete,
  updateProxy,
} from './ownProxies';
import { validLocation } from './plans';
import { stopTesting, testAll, testDraft, testProxy } from './proxyTests';
import { commit, current, setSettings } from './store';

function urlFor(target: OpenTarget): string {
  switch (target.kind) {
    case 'dashboard':
      return chrome.runtime.getURL(EXT_PAGE.dashboard) + (target.query ? `?${target.query}` : '');
    case 'web':
      return FP_LINKS[target.page];
    case 'url':
      return target.url;
    case 'extensions':
      return target.details ? extensionDetailsUrl(chrome.runtime.id) : CHROME_EXTENSIONS_URL;
  }
}

const isActiveOwn = (id: string) => {
  const active = current().settings.active;
  return active?.kind === 'own' && active.proxyId === id;
};

async function reconnectIfActive(id: string) {
  if (isActiveOwn(id)) await reconnectIfLive();
  else await reroute();
}

export async function handleAction(action: Action): Promise<void> {
  const { settings } = current();
  switch (action.type) {
    case 'signIn':
      return openSignIn(action.connect);
    case 'signInCancel':
      return closeSignIn();
    case 'signOut':
      if (isLive()) await disconnect();
      return signOut();
    case 'switchAccount':
      if (isLive()) await disconnect();
      await signOut();
      return openSignIn(false);
    case 'refresh':
      return refreshAccount(true);
    case 'pickPlan':
      setSettings({ active: { kind: 'fp', planId: action.planId }, lastPlanId: action.planId });
      return reconnectIfLive({ transition: 'rotating' });
    case 'pickOwn':
      setSettings({ active: { kind: 'own', proxyId: action.proxyId } });
      return reconnectIfLive({ transition: 'rotating' });
    case 'setLocation': {
      const plan = connectViaPlan(current());
      setSettings({ location: plan ? validLocation(plan, action.location) : action.location });
      return reconnectIfLive({
        transition: 'rotating',
        toast: {
          text: 'Now exiting in ' + countryName(current().settings.location.cc),
          icon: 'check',
          color: TOAST_OK,
        },
      });
    }
    case 'connectVia': {
      const plan = connectViaPlan(current());
      if (!plan) return;
      setSettings({
        location: validLocation(plan, action.location),
        active: { kind: 'fp', planId: plan.id },
        lastPlanId: plan.id,
      });
      return connect();
    }
    case 'setSession':
      if (settings.session === action.session) return;
      setSettings({ session: action.session });
      return reconnectIfLive();
    case 'setUi':
      return setSettings({ ui: action.ui });
    case 'setMode':
      return setMode(action.mode);
    case 'toggleFavourite': {
      const on = settings.favourites.includes(action.cc);
      return setSettings({
        favourites: on
          ? settings.favourites.filter((code) => code !== action.cc)
          : [...settings.favourites, action.cc],
      });
    }
    case 'setSiteRule': {
      const { [action.domain]: _prev, ...rest } = settings.siteRules;
      setSettings({ siteRules: action.rule ? { ...rest, [action.domain]: action.rule } : rest });
      return reroute();
    }
    case 'open':
      await chrome.tabs.create({ url: urlFor(action.target) });
      return;
    case 'toggle':
      return toggle();
    case 'connect':
    case 'takeBack':
      return connect();
    case 'disconnect':
      return disconnect(action.mode);
    case 'rotate':
      return rotate();
    case 'nextProxy':
      return nextProxy();
  }
}

const RPC: Partial<{
  [K in RpcMethod]: (...args: Parameters<EngineApi[K]>) => ReturnType<EngineApi[K]>;
}> = {
  addProxy,
  updateProxy: async (id, draft) => {
    const proxy = await updateProxy(id, draft);
    await reconnectIfActive(id);
    return proxy;
  },
  duplicateProxy,
  moveProxy: async (id, providerId) => moveProxy(id, providerId),
  deleteProxy: async (id) => {
    const wasActive = isActiveOwn(id);
    const token = deleteProxy(id);
    if (wasActive && isLive()) await disconnect();
    else await reroute();
    return token;
  },
  undoDelete: async (token) => {
    undoDelete(token);
    await reroute();
  },
  setStrategy: async (id, strategy) => {
    setStrategy(id, strategy);
    await reconnectIfActive(id);
  },
  renameProvider: async (id, name) => renameProvider(id, name),
  setProviderColor: async (id, color) => setProviderColor(id, color),
  getCredentials,
  importProxies,
  testDraft,
  testProxy,
  testAll,
  stopTesting: async () => stopTesting(),
  addRule: async (pattern, target) => {
    const trimmed = pattern.trim();
    if (!trimmed) throw new Error('Type a site pattern first');
    const rule: Rule = {
      id: crypto.randomUUID(),
      pattern: trimmed,
      type: ruleType(trimmed),
      target,
      enabled: true,
    };
    commit({ rules: [rule, ...current().rules] });
    await reroute();
    return rule;
  },
  setRules: async (rules) => {
    commit({ rules: rules.map((rule) => ({ ...rule, type: ruleType(rule.pattern) })) });
    await reroute();
  },
  setSiteRules: async (siteRules) => {
    setSettings({ siteRules: { ...siteRules } });
    await reroute();
  },
  setApiKey,
  setTheme: async (theme) => setSettings({ theme }),
  setPopupUi: async (ui) => setSettings({ ui }),
};

export async function handleRpc(method: string, args: unknown[]): Promise<unknown> {
  const fn = RPC[method as RpcMethod] as ((...a: unknown[]) => Promise<unknown>) | undefined;
  if (!fn) throw new Error(NOT_AVAILABLE);
  return fn(...args);
}
