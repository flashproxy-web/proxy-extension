import { SNAPSHOT_PORT, type RpcResponse, type RuntimeMessage } from '@/shared/api/messages';
import { EXT_PAGE } from '@/shared/config';

import { refreshAccount, refreshIfStale } from './account';
import { dropLegacySession } from './api/apiKey';
import { HEALTH_ALARM, REFRESH_ALARM, REFRESH_MINUTES, STICKY_ALARM } from './config';
import { onHealthTick, onRefused, onSessionEnd, restore } from './connection';
import { handleAction, handleRpc } from './handlers';
import { credentialsFor } from './proxy';
import { attach, whenReady } from './store';

chrome.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    whenReady()
      .then(() => credentialsFor(details, () => void onRefused()))
      .then(
        (response) => callback?.(response),
        () => callback?.({})
      );
  },
  { urls: ['<all_urls>'] },
  ['asyncBlocking']
);

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== SNAPSHOT_PORT) return;
  attach(port);
  void whenReady().then(() => refreshIfStale());
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, reply: (response: RpcResponse) => void) => {
  if (message.type === 'action') {
    void whenReady().then(() => handleAction(message.action));
    return false;
  }
  whenReady()
    .then(() => handleRpc(message.method, message.args))
    .then(
      (value) => reply({ ok: true, value }),
      (error: unknown) => reply({ ok: false, error: error instanceof Error ? error.message : String(error) })
    );
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REFRESH_ALARM) void whenReady().then(() => refreshAccount());
  else if (alarm.name === STICKY_ALARM) void whenReady().then(() => onSessionEnd());
  else if (alarm.name === HEALTH_ALARM) void whenReady().then(() => onHealthTick());
});

chrome.runtime.onInstalled.addListener((details) => {
  void chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: REFRESH_MINUTES });
  void dropLegacySession();
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) void chrome.tabs.create({ url: chrome.runtime.getURL(EXT_PAGE.welcome) });
});

chrome.runtime.onStartup.addListener(() => {
  void whenReady()
    .then(() => restore())
    .then(() => refreshAccount());
});
