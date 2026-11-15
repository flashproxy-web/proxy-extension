import type { Protocol, Status } from '../model';

// Values that depend on the FlashProxy backend. Everything marked PLACEHOLDER
// must be confirmed with the backend team before release.

export const FP_WEB =
  (import.meta.env.VITE_FP_WEB as string | undefined) ?? 'https://www.flashproxy.com';
export const FP_API = `${FP_WEB}/api/v1`;

/** PLACEHOLDER paths on the FlashProxy website. /auth/login and /dashboard/settings?tab=api are confirmed. */
export const FP_LINKS = {
  login: `${FP_WEB}/auth/login`,
  account: `${FP_WEB}/dashboard`,
  apiKeys: `${FP_WEB}/dashboard/settings?tab=api`,
  contact: `${FP_WEB}/contact`,
  docs: `${FP_WEB}/docs`,
  apiDocs: `${FP_WEB}/dashboard/api`,
  topup: `${FP_WEB}/dashboard/billing`,
  renew: `${FP_WEB}/dashboard/billing`,
  plans: `${FP_WEB}/pricing`,
} as const;

export const STICKY_SECONDS = 600;

export const LATENCY_MS = { fast: 100, slow: 250 } as const;

export const ERROR_STATES: readonly Status[] = [
  'auth',
  'unreach',
  'bw',
  'conflict',
  'noplans',
  'expired',
  'ownfail',
];

export const TOAST_OK = '#4ADE80';
export const TOAST_INFO = '#A98BFF';
export const TOAST_BAD = '#F87171';

export const PRODUCT_NAME = 'Proxy Management Extension by FlashProxy';
export const IN_EXTENSION = typeof chrome !== 'undefined' && !!chrome.runtime?.id;
export const VERSION = IN_EXTENSION ? chrome.runtime.getManifest().version : 'dev';

export const EXT_PAGE = { dashboard: 'dashboard.html', welcome: 'welcome.html' } as const;
export const CHROME_EXTENSIONS_URL = 'chrome://extensions';
export const extensionDetailsUrl = (id: string) => `${CHROME_EXTENSIONS_URL}/?id=${id}`;

const DASH_QUERY = { page: 'page', tab: 'tab', add: 'add', import: 'import' } as const;
const DASH_FLAG_ON = '1';
export const DASH_ROUTE = {
  proxies: `${DASH_QUERY.page}=proxies`,
  addProxy: `${DASH_QUERY.page}=proxies&${DASH_QUERY.tab}=own&${DASH_QUERY.add}=${DASH_FLAG_ON}`,
  rules: `${DASH_QUERY.page}=rules`,
  settings: `${DASH_QUERY.page}=settings`,
} as const;

export const DEFAULT_LOCALE = 'en-US';

export const PORT_RANGE = { min: 1, max: 65535 } as const;
export const PORT_DIGITS = String(PORT_RANGE.max).length;

export const NO_AUTH_PROTOCOLS: readonly Protocol[] = ['SOCKS4', 'SOCKS5'];

export const CUSTOM_PROVIDER = { name: 'Custom', color: '#6B6780' } as const;
export const AUTO_PROVIDER_ID = 'auto';
export const DEFAULT_POOL_NAME = 'Imported pool';
export const IMPORT_TAG = 'imported';
