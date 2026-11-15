import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  Browser,
  computeExecutablePath,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = path.join(root, '.cache', 'browsers');
const platform = detectBrowserPlatform();
const buildId = await resolveBuildId(Browser.CHROME, platform, 'stable');
const exe = computeExecutablePath({ browser: Browser.CHROME, buildId, cacheDir });
if (!fs.existsSync(exe)) {
  console.log(`Downloading Chrome for Testing ${buildId}…`);
  await install({ browser: Browser.CHROME, buildId, cacheDir });
}
const out = path.join(root, 'e2e', 'out');
fs.mkdirSync(out, { recursive: true });
const r = spawnSync(
  process.execPath,
  [path.join(root, 'e2e', 'e2e.mjs'), path.join(root, 'dist'), exe, out],
  { stdio: 'inherit' }
);
process.exit(r.status ?? 1);
