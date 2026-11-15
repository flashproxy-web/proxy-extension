// npm run shots: README screenshots of the real extension, writes docs/screenshots/.
//
// Builds the extension into .cache/shots-dist against a local mock of the FlashProxy
// API, loads it in Chrome for Testing (see e2e/run.mjs) and drives the real popup,
// dashboard and welcome pages. Every upstream is local: proxies are a fake gateway
// that answers the exit-IP probe with documentation addresses (RFC 5737), and Chrome
// resolves nothing but the made-up *.example hosts, so no real IP, account or proxy
// can end up in a picture. Needs `openssl` on PATH for a throwaway TLS certificate.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  Browser,
  computeExecutablePath,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers';
import puppeteer from 'puppeteer-core';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'docs', 'screenshots');
const DIST = path.join(root, '.cache', 'shots-dist');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fp-shots-'));

const LOCAL = '127.0.0.1';
const API_PORT = 18490;
const GATEWAY_PORT = 18777;
const OWN_PORTS = { acmeUs: 18701, acmeUk: 18702, northwind: 18703 };
const SCALE = 2;
const POPUP = { width: 380, height: 600, deviceScaleFactor: SCALE };
const PAGE = { width: 1280, height: 800, deviceScaleFactor: SCALE };
const API_KEY = `fpk_live_${'x'.repeat(43)}`;
const GB = 1_000_000_000;
const DAY = 86_400_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Exit identities the fake gateway hands out, keyed by country.
const EXITS = {
  de: {
    ip: '203.0.113.24',
    city: 'Frankfurt am Main',
    region: 'Hesse',
    country: 'DE',
    org: 'AS3320 Deutsche Telekom AG',
    timezone: 'Europe/Berlin',
    ms: 38,
  },
  us: {
    ip: '198.51.100.73',
    city: 'New York City',
    region: 'New York',
    country: 'US',
    org: 'AS7922 Comcast Cable Communications',
    timezone: 'America/New_York',
    ms: 61,
  },
  gb: {
    ip: '203.0.113.181',
    city: 'London',
    region: 'England',
    country: 'GB',
    org: 'AS2856 British Telecommunications',
    timezone: 'Europe/London',
    ms: 44,
  },
  nl: {
    ip: '192.0.2.57',
    city: 'Amsterdam',
    region: 'North Holland',
    country: 'NL',
    org: 'AS60781 LeaseWeb Netherlands',
    timezone: 'Europe/Amsterdam',
    ms: 29,
  },
  jp: {
    ip: '198.51.100.212',
    city: 'Tokyo',
    region: 'Tokyo',
    country: 'JP',
    org: 'AS2516 KDDI Corporation',
    timezone: 'Asia/Tokyo',
    ms: 142,
  },
};

// --- mock FlashProxy API -------------------------------------------------------------

const iso = (offsetDays) => new Date(Date.now() + offsetDays * DAY).toISOString();
const PLANS = [
  {
    plan_id: 'pln_res',
    product: 'residential',
    name: null,
    status: 'active',
    expires_at: iso(26),
    max_bytes: 100 * GB,
    bytes_used: 57.6 * GB,
  },
  {
    plan_id: 'pln_isp',
    product: 'isp',
    name: null,
    status: 'active',
    expires_at: iso(12),
    max_bytes: 25 * GB,
    bytes_used: 6.5 * GB,
  },
  {
    plan_id: 'pln_dc',
    product: 'datacenter',
    name: null,
    status: 'active',
    expires_at: iso(19),
    max_bytes: null,
    bytes_used: null,
  },
  {
    plan_id: 'pln_mob',
    product: 'mobile',
    name: null,
    status: 'expired',
    expires_at: iso(-9),
    max_bytes: 10 * GB,
    bytes_used: 10 * GB,
  },
];
const COUNTRY_NAMES = {
  de: 'Germany',
  us: 'United States',
  gb: 'United Kingdom',
  nl: 'Netherlands',
  jp: 'Japan',
  fr: 'France',
  ca: 'Canada',
  es: 'Spain',
  it: 'Italy',
  br: 'Brazil',
};
const LOCATIONS = {
  pln_res: null,
  pln_isp: ['us', 'de', 'gb', 'nl'],
  pln_dc: ['us', 'de', 'nl'],
  pln_mob: ['us'],
};

function startApi() {
  const send = (res, status, body) => {
    res.writeHead(status, {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    });
    res.end(JSON.stringify(body));
  };
  const ok = (res, data) => send(res, 200, { success: true, data });
  const server = http.createServer((req, res) => {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
      return send(res, 401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid API key' },
      });
    }
    const url = new URL(req.url, 'http://api');
    const route = url.pathname.replace(/^\/api\/v1/, '');
    if (route === '/me') return ok(res, { email: 'alex@example.com', name: 'Alex Kim' });
    if (route === '/key') return ok(res, { permissions: ['usage', 'proxies'] });
    if (route === '/plans') return ok(res, { plans: PLANS, total: PLANS.length });
    const match = route.match(/^\/plans\/([^/]+)\/(locations|proxies)$/);
    if (match && match[2] === 'locations') {
      const codes = LOCATIONS[match[1]];
      return ok(res, {
        any_country: !codes,
        countries: codes
          ? codes.map((code) => ({ code: code.toUpperCase(), name: COUNTRY_NAMES[code] }))
          : null,
      });
    }
    if (match && match[2] === 'proxies') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const { country } = JSON.parse(body || '{}');
        const cc = (country ?? 'us').toLowerCase();
        ok(res, {
          proxies: [
            `http://fp-${EXITS[cc] ? cc : 'us'}:demo-pass@gw.flashproxy.example:${GATEWAY_PORT}`,
          ],
        });
      });
      return;
    }
    send(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  });
  return new Promise((resolve) => server.listen(API_PORT, LOCAL, () => resolve(server)));
}

// --- fake upstream: TLS endpoints for the probe hosts, one per exit ------------------

function makeCert() {
  const key = path.join(TMP, 'key.pem');
  const cert = path.join(TMP, 'cert.pem');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-days',
      '1',
      '-keyout',
      key,
      '-out',
      cert,
      '-subj',
      '/CN=fp-shots',
      '-addext',
      'subjectAltName=DNS:ipinfo.io,DNS:v6.ipinfo.io,DNS:cp.cloudflare.com,DNS:api.country.is',
    ],
    { stdio: 'ignore' }
  );
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) };
}

async function startExitServers(tls) {
  const ports = {};
  for (const [cc, exit] of Object.entries(EXITS)) {
    const server = https.createServer(tls, async (req, res) => {
      await sleep(exit.ms);
      const host = (req.headers.host ?? '').split(':')[0];
      if (host === 'cp.cloudflare.com') {
        res.writeHead(204);
        return res.end();
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      if (host === 'api.country.is')
        return res.end(JSON.stringify({ ip: exit.ip, country: exit.country }));
      const { ms: _ms, ...info } = exit;
      res.end(JSON.stringify({ ...info, loc: '0,0' }));
    });
    await new Promise((resolve) => server.listen(0, LOCAL, resolve));
    ports[cc] = server.address().port;
  }
  return ports;
}

// A proxy that requires a login and tunnels every CONNECT to the chosen exit.
function startGateway(port, exitFor, exitPorts) {
  const server = http.createServer((_req, res) => {
    res.writeHead(502);
    res.end();
  });
  server.on('connect', (req, sock, head) => {
    const auth = req.headers['proxy-authorization'];
    if (!auth) {
      sock.end(
        'HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="shots"\r\nContent-Length: 0\r\n\r\n'
      );
      return;
    }
    const user = Buffer.from(auth.replace(/^Basic /, ''), 'base64')
      .toString()
      .split(':')[0];
    const up = net.connect(exitPorts[exitFor(user)], LOCAL, () => {
      sock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head?.length) up.write(head);
      up.pipe(sock);
      sock.pipe(up);
    });
    up.on('error', () => sock.destroy());
    sock.on('error', () => up.destroy());
  });
  return new Promise((resolve) => server.listen(port, LOCAL, () => resolve(server)));
}

// --- browser -------------------------------------------------------------------------

async function chromePath() {
  const cacheDir = path.join(root, '.cache', 'browsers');
  const buildId = await resolveBuildId(Browser.CHROME, detectBrowserPlatform(), 'stable');
  const exe = computeExecutablePath({ browser: Browser.CHROME, buildId, cacheDir });
  if (!fs.existsSync(exe)) await install({ browser: Browser.CHROME, buildId, cacheDir });
  return exe;
}

async function buildExtension() {
  process.env.VITE_FP_WEB = `http://${LOCAL}:${API_PORT}`;
  await build({
    configFile: path.join(root, 'vite.config.ts'),
    logLevel: 'warn',
    build: { outDir: DIST, emptyOutDir: true },
  });
}

// The popup reads the active tab to show the site card; in a test tab that would be the
// popup itself, so it is shown a made-up site instead.
const FAKE_TAB = () => {
  const query = chrome.tabs.query.bind(chrome.tabs);
  chrome.tabs.query = async (info) =>
    info?.active
      ? [
          {
            id: 4242,
            windowId: 1,
            active: true,
            url: 'https://shop.example.com/',
            title: 'Example Shop',
          },
        ]
      : query(info);
};

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const [exe] = await Promise.all([chromePath(), buildExtension()]);
  const exitPorts = await startExitServers(makeCert());
  const servers = [
    await startApi(),
    await startGateway(GATEWAY_PORT, (user) => user.replace(/^fp-/, ''), exitPorts),
    await startGateway(OWN_PORTS.acmeUs, () => 'us', exitPorts),
    await startGateway(OWN_PORTS.acmeUk, () => 'gb', exitPorts),
    await startGateway(OWN_PORTS.northwind, () => 'nl', exitPorts),
  ];

  const browser = await puppeteer.launch({
    executablePath: exe,
    headless: true,
    userDataDir: path.join(TMP, 'profile'),
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      `--disable-extensions-except=${DIST}`,
      `--load-extension=${DIST}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--ignore-certificate-errors',
      '--force-color-profile=srgb',
      '--host-resolver-rules=MAP *.example 127.0.0.1, MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
      ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []),
    ],
  });

  try {
    const target = await browser.waitForTarget(
      (t) => t.type() === 'service_worker' && t.url().endsWith('/background.js'),
      { timeout: 15_000 }
    );
    const sw = await target.worker();
    const base = `chrome-extension://${new URL(target.url()).host}`;
    const control = await browser.newPage();
    await control.goto(`${base}/dashboard.html`);
    const rpc = async (method, ...args) => {
      const res = await control.evaluate(
        (m, a) => chrome.runtime.sendMessage({ type: 'rpc', method: m, args: a }),
        method,
        args
      );
      if (!res?.ok) throw new Error(`${method}: ${res?.error}`);
      return res.value;
    };
    const act = (action) =>
      control.evaluate((a) => chrome.runtime.sendMessage({ type: 'action', action: a }), action);
    const status = async () =>
      (await sw.evaluate(() => chrome.storage.session.get('runtime'))).runtime?.status;
    const waitOn = async () => {
      for (let i = 0; i < 120 && (await status()) !== 'on'; i++) await sleep(250);
      await sleep(1500);
    };

    const shoot = async (file, url, viewport, then) => {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(FAKE_TAB);
      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
      await sleep(900);
      if (then) {
        await then(page);
        await sleep(700);
      }
      await page.screenshot({ path: path.join(OUT, `${file}.png`) });
      await page.close();
      console.log(`  ${file}.png`);
    };
    const clickText =
      (text, sel = 'button') =>
      (page) =>
        page.evaluate(
          (s, t) =>
            [...document.querySelectorAll(s)]
              .find((e) => e.textContent.trim().includes(t))
              ?.click(),
          sel,
          text
        );
    const popup = (file, then) => shoot(file, `${base}/popup.html`, POPUP, then);
    const dash = (file, query, then) => shoot(file, `${base}/dashboard.html?${query}`, PAGE, then);

    for (const page of await browser.pages())
      if (page.url().endsWith('/welcome.html')) await page.close();

    console.log('Shooting:');
    await popup('popup-onboarding');
    await act({ type: 'signIn', connect: false });
    await popup('popup-api-key');
    await rpc('setApiKey', API_KEY);

    const own = (label, provider, host, port, tags = []) =>
      rpc('addProxy', {
        label,
        providerId: null,
        newProvider: provider,
        protocol: 'HTTP',
        endpoints: [{ host, port }],
        strategy: 'round',
        username: 'demo',
        password: 'demo-pass',
        tags,
      });
    const acmeUs = await own(
      'US residential',
      'Acme Proxies',
      'us.gate.acme-proxies.example',
      OWN_PORTS.acmeUs,
      ['residential']
    );
    await own('UK residential', 'Acme Proxies', 'uk.gate.acme-proxies.example', OWN_PORTS.acmeUk, [
      'residential',
    ]);
    await own('Amsterdam DC', 'Northwind Networks', 'ams1.northwind.example', OWN_PORTS.northwind, [
      'datacenter',
    ]);
    await rpc('testAll');
    await sleep(4000);

    await act({ type: 'pickPlan', planId: 'pln_res' });
    await act({ type: 'setLocation', location: { cc: 'de', city: null, isp: 'any' } });
    await act({ type: 'setMode', mode: 'global' });
    await act({ type: 'connect' });
    await waitOn();

    await rpc('setPopupUi', 'simple');
    await popup('popup-simple');
    await rpc('setPopupUi', 'pro');
    await popup('popup-pro');
    await popup('popup-locations', clickText('Change'));

    await rpc('addRule', '*.example.com', { kind: 'fp', planId: 'pln_res' });
    await rpc('addRule', 'github.com', { kind: 'direct' });
    await rpc('addRule', '*.ads.example.net', { kind: 'block' });
    await rpc('addRule', '10.0.0.0/8', { kind: 'direct' });
    await act({ type: 'setMode', mode: 'smart' });
    await waitOn();
    await popup('popup-smart');
    await dash('dashboard-rules', 'page=rules');

    await act({ type: 'pickOwn', proxyId: acmeUs.id });
    await act({ type: 'setMode', mode: 'global' });
    await waitOn();
    await popup('popup-own-proxy');

    await act({ type: 'pickPlan', planId: 'pln_res' });
    await waitOn();
    await dash('dashboard-plans', 'page=proxies&tab=fp');
    await dash('dashboard-own-proxies', 'page=proxies&tab=own');
    await dash('dashboard-add-proxy', 'page=proxies&tab=own&add=1');
    await dash('dashboard-import', 'page=proxies&tab=own', async (page) => {
      await clickText('Import')(page);
      await page.waitForSelector('[role=dialog] textarea');
      await page.type(
        '[role=dialog] textarea',
        [
          'gate.acme-proxies.example:7000:demo:demo-pass',
          'http://demo:demo-pass@eu.northwind.example:8080',
          'socks5://198.51.100.9:1080',
          'not a proxy',
        ].join('\n')
      );
      await page.evaluate(() => document.activeElement?.blur());
    });
    await dash('dashboard-settings', 'page=settings');
    await shoot('welcome', `${base}/welcome.html`, PAGE);

    await rpc('setTheme', 'dark');
    await popup('popup-dark');
    await dash('dashboard-dark', 'page=proxies&tab=fp');
    await rpc('setTheme', 'system');
  } finally {
    await browser.close();
    for (const server of servers) server.close();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
  console.log(`Wrote ${OUT}`);
  process.exit(0);
}

await main();
