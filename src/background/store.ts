import { EMPTY_SNAPSHOT } from '@/shared/api/fallback';
import type { PortMessage } from '@/shared/api/messages';
import type { Persisted, Runtime, Settings, Snapshot, Toast } from '@/shared/model';

import { STORAGE_KEY } from './config';

let state: Snapshot = structuredClone(EMPTY_SNAPSHOT);
const ports = new Set<chrome.runtime.Port>();

const ready = Promise.all([
  chrome.storage.local.get(STORAGE_KEY.state),
  chrome.storage.session.get(STORAGE_KEY.runtime),
]).then(([stored, session]) => {
  const saved = stored[STORAGE_KEY.state] as Partial<Persisted> | undefined;
  const runtime = session[STORAGE_KEY.runtime] as Partial<Runtime> | undefined;
  state = {
    ...state,
    ...saved,
    settings: { ...state.settings, ...saved?.settings },
    runtime: { ...state.runtime, ...runtime, signin: null },
  };
});

export const whenReady = () => ready;

export const current = () => state;

function persisted(snapshot: Snapshot): Persisted {
  const { runtime: _runtime, ...rest } = snapshot;
  return rest;
}

function broadcast(message: PortMessage) {
  for (const port of ports) port.postMessage(message);
}

export function commit(patch: Partial<Persisted>, runtime: Partial<Runtime> = {}) {
  state = { ...state, ...patch, runtime: { ...state.runtime, ...runtime } };
  if (Object.keys(patch).length) void chrome.storage.local.set({ [STORAGE_KEY.state]: persisted(state) });
  if (Object.keys(runtime).length) void chrome.storage.session.set({ [STORAGE_KEY.runtime]: state.runtime });
  broadcast({ type: 'snapshot', snapshot: state });
}

export const setSettings = (patch: Partial<Settings>) => commit({ settings: { ...state.settings, ...patch } });

export const setRuntime = (patch: Partial<Runtime>) => commit({}, patch);

export const toast = (message: Toast) => broadcast({ type: 'toast', toast: message });

export function attach(port: chrome.runtime.Port) {
  ports.add(port);
  port.onDisconnect.addListener(() => ports.delete(port));
  void ready.then(() => port.postMessage({ type: 'snapshot', snapshot: state } satisfies PortMessage));
}
