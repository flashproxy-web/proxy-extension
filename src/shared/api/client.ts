import { IN_EXTENSION } from '../config';

import { EMPTY_SNAPSHOT, NOT_AVAILABLE } from './fallback';
import { SNAPSHOT_PORT, type PortMessage, type RpcResponse, type RuntimeMessage } from './messages';

import type {
  Action,
  Credentials,
  OwnProxy,
  PoolStrategy,
  PopupUi,
  Protocol,
  ProxyDraft,
  Rule,
  RuleTarget,
  SiteRule,
  Snapshot,
  TestResult,
  Theme,
  Toast,
} from '../model';

export interface EngineApi {
  addProxy(draft: ProxyDraft): Promise<OwnProxy>;
  updateProxy(id: string, draft: ProxyDraft): Promise<OwnProxy>;
  duplicateProxy(id: string): Promise<void>;
  moveProxy(id: string, providerId: string): Promise<void>;
  deleteProxy(id: string): Promise<string>;
  undoDelete(token: string): Promise<void>;
  setStrategy(id: string, strategy: PoolStrategy): Promise<void>;
  renameProvider(id: string, name: string): Promise<void>;
  setProviderColor(id: string, color: string): Promise<void>;
  getCredentials(id: string): Promise<Credentials | null>;
  testDraft(d: ProxyDraft): Promise<TestResult>;
  testProxy(id: string, quiet?: boolean): Promise<TestResult>;
  testAll(): Promise<{ total: number; healthy: number; failing: number; stopped: boolean }>;
  stopTesting(): Promise<void>;
  importProxies(
    items: { protocol: Protocol; host: string; port: number; username: string; password: string }[],
    mode: 'separate' | 'pool',
    providerId: string,
    poolName: string
  ): Promise<number>;
  addRule(pattern: string, target: RuleTarget): Promise<Rule>;
  setRules(rules: Rule[]): Promise<void>;
  setSiteRules(siteRules: Record<string, SiteRule>): Promise<void>;
  /** Checks the key with flashproxy.com and saves it; rejects with a message to show. */
  setApiKey(key: string): Promise<void>;
  setTheme(theme: Theme): Promise<void>;
  setPopupUi(ui: PopupUi): Promise<void>;
}

export type RpcMethod = keyof EngineApi;

interface Client {
  subscribe(
    onSnapshot: (snapshot: Snapshot) => void,
    onDisconnect?: () => void,
    onToast?: (toast: Toast) => void
  ): () => void;
  send(action: Action): void;
  call<K extends RpcMethod>(
    method: K,
    ...args: Parameters<EngineApi[K]>
  ): Promise<Awaited<ReturnType<EngineApi[K]>>>;
}

function extensionClient(): Client {
  return {
    subscribe(onSnapshot, onDisconnect, onToast) {
      const port = chrome.runtime.connect({ name: SNAPSHOT_PORT });
      port.onMessage.addListener((message: PortMessage) =>
        message.type === 'snapshot' ? onSnapshot(message.snapshot) : onToast?.(message.toast)
      );
      port.onDisconnect.addListener(() => onDisconnect?.());
      return () => port.disconnect();
    },
    send(action) {
      const message: RuntimeMessage = { type: 'action', action };
      void chrome.runtime.sendMessage(message).catch(() => undefined);
    },
    async call(method, ...args) {
      const message: RuntimeMessage = { type: 'rpc', method, args };
      const res: RpcResponse | undefined = await chrome.runtime.sendMessage(message);
      if (!res) throw new Error(NOT_AVAILABLE);
      if (!res.ok) throw new Error(res.error);
      return res.value as never;
    },
  };
}

function fallbackClient(): Client {
  return {
    subscribe(onSnapshot) {
      onSnapshot(structuredClone(EMPTY_SNAPSHOT));
      return () => {};
    },
    send() {},
    call: () => Promise.reject(new Error(NOT_AVAILABLE)),
  };
}

export const { subscribe, send, call } = IN_EXTENSION ? extensionClient() : fallbackClient();
