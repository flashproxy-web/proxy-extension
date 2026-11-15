import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

import { startProxy } from './proxy.mjs';

const [, , EXT, EXE, OUT] = process.argv;

const USER = 'alice';
const PASS = 's3cret-pa55';
const WRONG_PASS = 'wrong-pa55';
const AUTH_PORT = 18081;
const OPEN_PORT = 18082;
const LOCAL_HOST = '127.0.0.1';
const TEST_HOST = 'api.country.is';
const PROBE_HOST = 'ipinfo.io';
const STATUS_TIMEOUT_MS = 30_000;
const POLL_MS = 250;
const PAGE_TIMEOUT_MS = 30_000;
const POPUP_VIEWPORT = { width: 380, height: 600 };
const DASH_VIEWPORT = { width: 1280, height: 860 };
const API_DOCS_PATH = '/dashboard/api';
const REMOTE_FLAG_HOST = 'flagcdn.com';
const ROOT_ARGS = process.getuid?.() === 0 ? ['--no-sandbox'] : [];

const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const since = (log, mark) => log.slice(mark);
const basic = (user, pass) => 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

async function waitFor(check, ms = STATUS_TIMEOUT_MS) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (await check()) return true;
    await sleep(POLL_MS);
  }
  return false;
}

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fp-e2e-'));

const launch = () =>
  puppeteer.launch({
    executablePath: EXE,
    headless: true,
    userDataDir,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`,
      '--no-first-run',
      '--no-default-browser-check',
      ...ROOT_ARGS,
    ],
  });

async function attach(browser) {
  const target = await browser.waitForTarget(
    (t) => t.type() === 'service_worker' && t.url().endsWith('/background.js'),
    { timeout: 15_000 }
  );
  const sw = await target.worker();
  const extId = new URL(target.url()).host;
  const page = await browser.newPage();
  await page.setViewport(DASH_VIEWPORT);
  await page.goto(`chrome-extension://${extId}/dashboard.html`);
  const rpc = async (method, ...args) => {
    const res = await page.evaluate(
      (m, a) => chrome.runtime.sendMessage({ type: 'rpc', method: m, args: a }),
      method,
      args
    );
    if (!res?.ok) throw new Error(`${method}: ${res?.error}`);
    return res.value;
  };
  const act = (action) =>
    page.evaluate((a) => chrome.runtime.sendMessage({ type: 'action', action: a }), action);
  const runtime = async () =>
    (await sw.evaluate(() => chrome.storage.session.get('runtime'))).runtime ?? {};
  const status = async () => (await runtime()).status;
  const waitStatus = (want, ms) => waitFor(async () => (await status()) === want, ms);
  const proxySetting = () =>
    sw.evaluate(() => new Promise((resolve) => chrome.proxy.settings.get({}, resolve)));
  return { sw, extId, dash: page, rpc, act, status, waitStatus, proxySetting };
}

const draft = (label, port, username = '', password = '') => ({
  label,
  providerId: null,
  newProvider: 'Test Lab',
  protocol: 'HTTP',
  endpoints: [{ host: LOCAL_HOST, port }],
  strategy: 'round',
  username,
  password,
  tags: [],
});

const good = await startProxy({ port: AUTH_PORT, user: USER, pass: PASS });
const open = await startProxy({ port: OPEN_PORT });
const remoteFlags = [];
const browser = await launch();

try {
  browser.on('targetcreated', async (target) => {
    const page = await target.page().catch(() => null);
    page?.on('request', (req) => {
      if (req.url().includes(REMOTE_FLAG_HOST)) remoteFlags.push(req.url());
    });
  });
  let ext = await attach(browser);
  ok('service worker starts', true, ext.extId);

  const welcome = await browser
    .waitForTarget((t) => t.type() === 'page' && t.url().endsWith('/welcome.html'), {
      timeout: 10_000,
    })
    .catch(() => null);
  ok('welcome page opens on install', !!welcome);
  if (welcome) {
    const page = await welcome.page();
    const text = await page.evaluate(() => document.body.innerText);
    ok('welcome page does not advertise leak protection', !/leak protection/i.test(text));
    await page.screenshot({ path: path.join(OUT, '00-welcome.png') });
    await page.close();
  }

  const manifest = await ext.sw.evaluate(() => chrome.runtime.getManifest());
  ok(
    'store description does not advertise leak protection',
    !/leak protection/i.test(manifest.description),
    manifest.description
  );

  const popup = await browser.newPage();
  await popup.setViewport(POPUP_VIEWPORT);
  await popup.goto(`chrome-extension://${ext.extId}/popup.html`);
  const popupText = () => popup.evaluate(() => document.body.innerText);
  ok(
    'popup shows onboarding with no sources',
    await waitFor(async () => (await popupText()).includes('How do you want to connect?'))
  );
  await popup.screenshot({ path: path.join(OUT, '01-onboarding.png') });

  const proxyA = await ext.rpc('addProxy', draft('Proxy A', AUTH_PORT, USER, PASS));
  ok('own proxy added', !!proxyA?.id, proxyA?.id);
  const rejected = await ext
    .rpc('addProxy', {
      ...draft('Hostile', AUTH_PORT),
      endpoints: [{ host: "evil'; return 'DIRECT", port: 80 }],
    })
    .then(
      () => false,
      () => true
    );
  ok('proxy with an invalid host is rejected', rejected);

  await ext.act({ type: 'pickOwn', proxyId: proxyA.id });
  await ext.act({ type: 'connect' });
  ok('connects through proxy A', await ext.waitStatus('on'), await ext.status());
  const fixed = await ext.proxySetting();
  ok(
    'chrome.proxy is fixed_servers on the test proxy',
    fixed.value?.mode === 'fixed_servers' && fixed.value?.rules?.singleProxy?.port === AUTH_PORT,
    JSON.stringify(fixed.value?.rules?.singleProxy)
  );
  ok(
    'proxy got the probe with credentials',
    good.log.some((line) => line.type === 'connect' && line.url.startsWith(PROBE_HOST))
  );

  const local = JSON.stringify(await ext.sw.evaluate(() => chrome.storage.local.get(null)));
  ok(
    'no plaintext login in chrome.storage.local while connected',
    !local.includes(PASS) && !local.includes(USER)
  );
  ok('applied proxy is sealed for browser restarts', local.includes('vault:appliedProxy'));

  const proxyB = await ext.rpc('addProxy', draft('Proxy B', AUTH_PORT, USER, WRONG_PASS));
  const testB = await ext.rpc('testProxy', proxyB.id);
  ok(
    'test of a wrong password on the connected gateway fails',
    testB?.ok === false && testB.short === 'Auth failed',
    JSON.stringify(testB)
  );
  const testDraft = await ext.rpc('testDraft', draft('Draft', AUTH_PORT, USER, WRONG_PASS));
  ok(
    'draft test of a wrong password on the connected gateway fails',
    testDraft?.ok === false && testDraft.short === 'Auth failed',
    JSON.stringify(testDraft)
  );
  const testA = await ext.rpc('testProxy', proxyA.id);
  ok('test of the right password passes', testA?.ok === true, JSON.stringify(testA).slice(0, 120));

  let mark = good.log.length;
  const after = await browser.newPage();
  await after
    .goto('https://example.com/', { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS })
    .catch(() => null);
  await after.close();
  ok(
    'browsing keeps the right login after the tests',
    since(good.log, mark).some((line) => line.url.includes('example.com')) &&
      !since(good.log, mark).some((line) => line.sent === basic(USER, WRONG_PASS)),
    JSON.stringify(since(good.log, mark)).slice(0, 200)
  );

  await ext.act({ type: 'pickOwn', proxyId: proxyB.id });
  ok(
    'switching to the wrong password on the same gateway fails auth',
    await ext.waitStatus('auth'),
    await ext.status()
  );
  await ext.act({ type: 'pickOwn', proxyId: proxyA.id });
  await ext.act({ type: 'connect' });
  ok(
    'switching back to the right password reconnects',
    await ext.waitStatus('on'),
    await ext.status()
  );

  await ext.act({ type: 'setUi', ui: 'pro' });
  await popup.reload();
  await waitFor(async () => (await popupText()).includes('Proxy A'));
  const proText = await popupText();
  ok(
    'Pro popup shows no leak-protection pills',
    !/WebRTC|Timezone off|Geolocation off/.test(proText)
  );
  await popup.screenshot({ path: path.join(OUT, '02-pro-connected.png') });

  await ext.dash.goto(`chrome-extension://${ext.extId}/dashboard.html?page=api`);
  await waitFor(async () =>
    (await ext.dash.evaluate(() => document.body.innerText)).includes('Proxies')
  );
  const docsLink = await ext.dash.$$eval('aside a', (links) => links.map((link) => link.href));
  const dashText = await ext.dash.evaluate(() => document.body.innerText);
  ok(
    'dashboard has no internal API page',
    !/open questions/i.test(dashText) && !dashText.includes('src/')
  );
  ok(
    'sidebar links to the public API docs',
    docsLink.some((href) => href.endsWith(API_DOCS_PATH)),
    docsLink.join(',')
  );
  await ext.dash.screenshot({ path: path.join(OUT, '03-dashboard.png') });

  await ext.rpc('addRule', 'example.org', { kind: 'block' });
  await ext.rpc('addRule', 'example.com', { kind: 'own', proxyId: proxyA.id });
  await ext.act({ type: 'setMode', mode: 'smart' });
  ok(
    'Smart mode installs a PAC script with the rules',
    await waitFor(async () => {
      const setting = await ext.proxySetting();
      return (
        setting.value?.mode === 'pac_script' && setting.value.pacScript.data.includes('example.org')
      );
    })
  );
  const web = await browser.newPage();
  const blocked = await web.goto('https://example.org/', { timeout: PAGE_TIMEOUT_MS }).then(
    () => 'loaded',
    (error) => error.message
  );
  ok('Block rule stops the page', blocked !== 'loaded', blocked);
  mark = good.log.length;
  await web
    .goto('https://www.example.com/', { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS })
    .catch(() => null);
  ok(
    'domain rule sends www.example.com through the own proxy',
    since(good.log, mark).some((line) => line.url.includes('example.com'))
  );
  mark = good.log.length;
  const direct = await web
    .goto('https://example.net/', { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS })
    .then(
      () => 'loaded',
      (error) => error.message
    );
  ok(
    'everything else goes direct',
    direct === 'loaded' && !since(good.log, mark).some((line) => line.url.includes('example.net')),
    direct
  );
  await web.close();
  await ext.rpc('setRules', []);
  await ext.act({ type: 'setMode', mode: 'global' });
  await ext.waitStatus('on');

  const line = (port) => ({ protocol: 'HTTP', host: LOCAL_HOST, port, username: '', password: '' });
  const imported = await ext.rpc(
    'importProxies',
    [line(OPEN_PORT), line(OPEN_PORT + 1)],
    'pool',
    'auto',
    'Imported pool'
  );
  const pool = (
    await ext.sw.evaluate(() => chrome.storage.local.get('state'))
  ).state.ownProxies.find((proxy) => proxy.label === 'Imported pool');
  ok('import as one pool', imported === 2 && pool?.endpoints.length === 2);
  const token = await ext.rpc('deleteProxy', pool.id);
  await ext.rpc('undoDelete', token);
  const restored = (
    await ext.sw.evaluate(() => chrome.storage.local.get('state'))
  ).state.ownProxies.some((proxy) => proxy.id === pool.id);
  ok('undo restores a deleted proxy', restored);
  const hostileImport = await ext
    .rpc('importProxies', [{ ...line(80), host: "x'; return 'DIRECT" }], 'separate', 'auto', '')
    .then(
      () => false,
      () => true
    );
  ok('import with an invalid host is rejected', hostileImport);

  const testOpen = await ext.rpc('testDraft', draft('Open', OPEN_PORT));
  ok(
    'test of a no-auth proxy reaches the test host through it',
    testOpen?.ok === true && open.log.some((entry) => entry.url.startsWith(TEST_HOST)),
    JSON.stringify(testOpen).slice(0, 120)
  );

  ok(
    'no flags requested from a remote CDN',
    remoteFlags.length === 0,
    remoteFlags.slice(0, 3).join(',')
  );

  await ext.act({ type: 'pickOwn', proxyId: proxyA.id });
  await ext.waitStatus('on');
  await ext.sw.evaluate(async (origin) => {
    await chrome.storage.session.clear();
    await chrome.browsingData.remove({ origins: [origin] }, { cookies: true });
  }, `http://${LOCAL_HOST}:${AUTH_PORT}`);
  const kept = await ext.proxySetting();
  ok(
    'proxy setting survives the session wipe a restart causes',
    kept.value?.mode === 'fixed_servers',
    kept.value?.mode
  );
  mark = good.log.length;
  const restoredTab = await browser.newPage();
  await restoredTab.setCacheEnabled(false);
  const restoredLoad = await restoredTab
    .goto('https://example.net/', { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS })
    .then(
      () => 'loaded',
      (error) => error.message
    );
  const restartLog = since(good.log, mark);
  ok(
    'tabs load through the proxy after a restart, before any reconnect',
    restoredLoad === 'loaded' &&
      restartLog.some((entry) => entry.type === '407-connect') &&
      restartLog.some((entry) => entry.type === 'connect' && entry.url.includes('example.net')),
    `${restoredLoad} ${JSON.stringify(restartLog).slice(0, 160)}`
  );
} catch (error) {
  ok('unexpected error', false, error.stack);
} finally {
  await browser.close().catch(() => undefined);
  good.server.close();
  open.server.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  const failed = results.filter((result) => !result.pass).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}
