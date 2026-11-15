// npm run shots — screenshots for the README, taken from the dev preview (sample data,
// fake platform), so they never show a real IP or real proxies. Writes docs/screenshots/.
// Uses Chrome for Testing from .cache/ (see e2e/run.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Browser, computeExecutablePath, detectBrowserPlatform, install, resolveBuildId } from '@puppeteer/browsers';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs', 'screenshots');
fs.mkdirSync(out, { recursive: true });
const cacheDir = path.join(root, '.cache', 'browsers');
const buildId = await resolveBuildId(Browser.CHROME, detectBrowserPlatform(), 'stable');
const exe = computeExecutablePath({ browser: Browser.CHROME, buildId, cacheDir });
if (!fs.existsSync(exe)) await install({ browser: Browser.CHROME, buildId, cacheDir });

const vite = await createServer({ root, logLevel: 'warn', server: { port: 5199, strictPort: false } });
await vite.listen();
const base = vite.resolvedUrls.local[0].replace(/\/$/, '');
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'public', 'manifest.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = (page, sel, text) =>
  page.evaluate(
    (s, t) => {
      const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim().includes(t));
      el?.click();
      return !!el;
    },
    sel,
    text,
  );

// Made-up lines that show provider detection, mixed formats and one error.
const IMPORT_DEMO = [
  'brd.superproxy.io:33335:brd-customer-demo-zone-res:demo-pass',
  'pr.oxylabs.io:7777:customer-demo:demo-pass',
  'http://demo:demo-pass@gate.smartproxy.com:7000',
  '203.0.113.20:3128',
  'not a proxy',
].join(String.fromCharCode(10));
async function importDemo(page) {
  await clickText(page, 'button', 'Import');
  await page.waitForSelector('[role=dialog] textarea');
  await page.type('[role=dialog] textarea', IMPORT_DEMO);
  await page.evaluate(() => document.activeElement?.blur());
}

// [file, query, { dark, then }]
const POPUP = [
  ['popup-connected', 'on'],
  ['popup-smart', 'smart'],
  ['popup-own-proxy', 'own'],
  ['popup-locations', 'on', { then: (p) => clickText(p, 'button', 'Change') }],
  ['popup-onboarding', 'onboarding'],
  ['popup-auth-error', 'auth'],
  ['popup-dark', 'on', { dark: true }],
];
const DASH = [
  ['dashboard-plans', 'page=proxies&tab=fp'],
  ['dashboard-own-proxies', 'page=proxies&tab=own'],
  ['dashboard-add-proxy', 'page=proxies&tab=own&add=1'],
  ['dashboard-import', 'page=proxies&tab=own', { then: importDemo }],
  ['dashboard-rules', 'page=rules'],
  ['dashboard-settings', 'page=settings'],
  ['dashboard-dark', 'page=proxies&tab=own', { dark: true }],
];

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--force-color-profile=srgb'] });
try {
  const shoot = async (file, url, viewport, opts = {}, clip = null) => {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: opts.dark ? 'dark' : 'light' }]);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await sleep(1500); // engine start + entry animations
    // The preview has no manifest, so pages label themselves "vdev".
    await page.evaluate((v) => {
      // React renders `v{VERSION}` as two text nodes: "v" and "dev".
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const n = w.currentNode;
        if (n.nodeValue === 'dev' && n.previousSibling?.nodeValue?.endsWith('v')) n.nodeValue = v;
      }
    }, version);
    if (opts.then) {
      await opts.then(page);
      await sleep(700);
    }
    const target = clip ? await page.$(clip) : null;
    await (target ?? page).screenshot({ path: path.join(out, file + '.png'), fullPage: !target && !!opts.full });
    await page.close();
    console.log('shot:', file);
  };

  for (const [file, state, opts] of POPUP) {
    await shoot(file, `${base}/popup.html?state=${state}`, { width: 380, height: 640, deviceScaleFactor: 2 }, opts, '.popup');
  }
  for (const [file, query, opts] of DASH) {
    await shoot(file, `${base}/dashboard.html?${query}`, { width: 1280, height: 820, deviceScaleFactor: 1 }, opts);
  }
  await shoot('welcome', `${base}/welcome.html?state=new`, { width: 1280, height: 820, deviceScaleFactor: 1 }, { full: true });
} finally {
  await browser.close();
  await vite.close();
}
