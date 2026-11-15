export { FP_API } from '@/shared/config';

export const FP_API_PATH = {
  me: '/me',
  key: '/key',
  plans: '/plans',
  locations: (planId: string) => `/plans/${encodeURIComponent(planId)}/locations`,
  proxies: (planId: string) => `/plans/${encodeURIComponent(planId)}/proxies`,
} as const;

export const PLAN_PAGE_SIZE = 100;

/** Keys from flashproxy.com Settings → API. */
export const API_KEY_PREFIX = 'fpk_live_';

/** The key permission that creates proxy logins; every key can read plans and usage. */
export const PROXIES_PERMISSION = 'proxies';

export const STORAGE_KEY = {
  state: 'state',
  apiKey: 'fpApiKey',
  legacySession: 'fpSession',
  runtime: 'runtime',
  proxy: 'fpProxy',
  routes: 'ruleRoutes',
  authLedger: 'authLedger',
  applied: 'appliedProxy',
  locations: 'planLocations',
} as const;

export const LEDGER_SKEW_MS = 2_000;

export const LOCATIONS_TTL_MS = 3 * 60 * 60 * 1000;
export const STALE_ACCOUNT_MS = 60_000;

export const REFRESH_ALARM = 'refresh-account';
export const REFRESH_MINUTES = 15;

export const BYTES_PER_GB = 1_000_000_000;

export const API_CODE = {
  unauthorized: 'UNAUTHORIZED',
  proxiesNotSupported: 'PROXIES_NOT_SUPPORTED',
  network: 'NETWORK_ERROR',
  badResponse: 'BAD_RESPONSE',
} as const;

export const STICKY_ALARM = 'sticky-session';
export const HEALTH_ALARM = 'health-check';
export const HEALTH_MINUTES = 1;
export const HEALTH_FAILS = 3;

export const PROBE = {
  ipUrl: 'https://ipinfo.io/json',
  ipv6Url: 'https://v6.ipinfo.io/json',
  pingUrl: 'https://cp.cloudflare.com/generate_204',
  testUrl: 'https://api.country.is/',
  fallbackIpUrl: 'https://api.country.is/',
  timeoutMs: 10_000,
} as const;

export const TEST_HOST = new URL(PROBE.testUrl).hostname;

export const TEST_SHORT = {
  timeout: 'Timed out',
  auth: 'Auth failed',
  notTested: 'Not tested',
  refused: 'Refused',
  cantLogin: 'Can’t log in',
} as const;

export const VAULT = {
  db: 'fp-vault',
  store: 'keys',
  keyId: 'master',
  prefix: 'vault:',
  ivBytes: 12,
  keyBits: 256,
} as const;

export const UNDO_PURGE_MS = 10_000;
export const USER_HINT = { hidden: 3, max: 10 } as const;

export const PROBE_HOSTS = [
  'ipinfo.io',
  new URL(PROBE.ipv6Url).hostname,
  'cp.cloudflare.com',
  new URL(PROBE.fallbackIpUrl).hostname,
] as const;

export const BADGE_TEXT = {
  off: '',
  on: 'on',
  smart: 'AUTO',
  connecting: '···',
  rotating: '↻',
  noData: '0GB',
  alert: '!',
  direct: 'DIR',
} as const;

export const BADGE_COLOR = {
  brand: '#7F50FF',
  warn: '#D97706',
  error: '#DC2626',
  text: '#FFFFFF',
} as const;
