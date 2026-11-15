// Data shapes shared by the background service worker, the popup, the dashboard
// and the welcome page.

export type Mode = 'direct' | 'global' | 'smart' | 'system';
export type Status =
  | 'off'
  | 'connecting'
  | 'on'
  | 'rotating'
  | 'auth'
  | 'unreach'
  | 'bw'
  | 'conflict'
  | 'noplans'
  | 'expired'
  | 'ownfail';
export type Theme = 'system' | 'light' | 'dark';
export const PROTOCOL_VALUES = ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'] as const;
export type Protocol = (typeof PROTOCOL_VALUES)[number];
export type PlanKind = 'res' | 'isp' | 'dc' | 'mob';
export type IspChoice = 'any' | 'isp' | 'mob';
export type SessionType = 'sticky' | 'rotating';
export type SiteRule = 'proxy' | 'direct';
/** Popup layout. Only changes what the popup shows, never any other setting. */
export type PopupUi = 'simple' | 'pro';
export const POOL_STRATEGY_VALUES = ['round', 'random', 'latency', 'failover'] as const;
export type PoolStrategy = (typeof POOL_STRATEGY_VALUES)[number];
export type RuleType = 'domain' | 'wildcard' | 'regex' | 'cidr';

export interface Account {
  email: string;
  name: string;
  initials: string;
}

interface Gateway {
  host: string;
  port: number;
  scheme: 'http' | 'https';
}

export interface Plan {
  id: string;
  kind: PlanKind;
  name: string;
  /** GB left. null = unmetered. */
  gbLeft: number | null;
  /** Plan size in GB. 0 = unmetered, so no bandwidth meter. */
  gbTotal: number;
  status: 'active' | 'expired';
  /** ISO date. */
  renewsAt?: string;
  /** ISO date. */
  expiredAt?: string;
  /** Countries this plan can target. null = every country on the network. */
  countries: string[] | null;
  cityTargeting: boolean;
  ipv6: boolean;
  gateway: Gateway;
}

/** Location data the FlashProxy API returns for city-level targeting. */
export interface GeoInfo {
  cities: string[];
  isp: string;
  asn: string;
}

export interface Provider {
  id: string;
  name: string;
  initial: string;
  color: string;
  /** Registrable domain the provider was detected from, e.g. superproxy.io. */
  domain: string | null;
}

export interface Endpoint {
  host: string;
  port: number;
  /** Results of the last test of this endpoint. */
  cc?: string | null;
  latency?: number | null;
  healthy?: boolean;
}

export interface OwnProxy {
  id: string;
  providerId: string;
  label: string;
  protocol: Protocol;
  /** More than one endpoint makes this proxy a pool. */
  endpoints: Endpoint[];
  /** How a pool picks an endpoint. Ignored for single proxies. */
  strategy: PoolStrategy;
  /** Credentials live in the encrypted on-device vault, never here. */
  hasAuth: boolean;
  /** First characters of the username, for the masked display. */
  userHint: string | null;
  tags: string[];
  /** Exit country detected on the last successful check. */
  cc: string | null;
  latency: number | null;
  healthy: boolean;
  failCount: number;
  /** Short reason for the last failed test, e.g. "Timed out". */
  error: string | null;
  /** ms timestamp of the last test or health check. */
  checkedAt: number | null;
}

export type ActiveSource = { kind: 'fp'; planId: string } | { kind: 'own'; proxyId: string };

export type RuleTarget =
  | { kind: 'fp'; planId: string }
  | { kind: 'own'; proxyId: string }
  | { kind: 'direct' }
  | { kind: 'block' };

export interface Location {
  cc: string;
  /** null = any city / country-level targeting. */
  city: string | null;
  isp: IspChoice;
}

export interface Rule {
  id: string;
  /** Domain, wildcard (*.amazon.*), regex on the URL, or an IPv4 CIDR range. */
  pattern: string;
  type: RuleType;
  target: RuleTarget;
  enabled: boolean;
}

export interface Settings {
  theme: Theme;
  ui: PopupUi;
  /** The FlashProxy plan used last, so Simple's Connect via can return to it from an own proxy. */
  lastPlanId: string | null;
  mode: Mode;
  active: ActiveSource | null;
  location: Location;
  session: SessionType;
  siteRules: Record<string, SiteRule>;
  favourites: string[];
  /** The user wants to be connected. Restored on browser start. */
  wantOn: boolean;
}

export interface Persisted {
  settings: Settings;
  account: Account | null;
  plans: Plan[];
  geo: Record<string, GeoInfo>;
  providers: Provider[];
  ownProxies: OwnProxy[];
  rules: Rule[];
}

export interface ExitInfo {
  ip: string;
  cc: string | null;
  city: string | null;
  isp: string | null;
  asn: string | null;
  tz: string | null;
  loc: [number, number] | null;
}

export interface SignIn {
  /** 'enter': the popup shows the API key form. 'load': the key works and plans are loading. */
  stage: 'enter' | 'load';
  connectAfter: boolean;
  /** Plans loaded so far while stage is 'load'. */
  step: number;
  /** Filled in once the key is accepted, so the popup can list plans as they load. */
  email: string | null;
  plans: Plan[];
}

export interface Runtime {
  status: Status;
  exit: ExitInfo | null;
  latency: number | null;
  sessionId: string;
  sessionExpiresAt: number | null;
  poolIdx: number;
  realIp: string | null;
  conflictName: string | null;
  /** Own proxies currently being tested. */
  testing: string[];
  /** Progress of "Test all". */
  testRun: { total: number; done: number } | null;
  signin: SignIn | null;
}

export interface Snapshot extends Persisted {
  runtime: Runtime;
}

export type OpenTarget =
  | { kind: 'dashboard'; query?: string }
  | { kind: 'web'; page: 'topup' | 'renew' | 'plans' | 'account' }
  | { kind: 'url'; url: string }
  | { kind: 'extensions'; details?: boolean };

/** Fire-and-forget actions sent from the popup and welcome page. */
export type Action =
  | { type: 'toggle' }
  | { type: 'connect' }
  | { type: 'disconnect'; mode?: Mode }
  | { type: 'setMode'; mode: Mode }
  | { type: 'rotate' }
  | { type: 'nextProxy' }
  | { type: 'setSession'; session: SessionType }
  | { type: 'setLocation'; location: Location }
  /** Simple popup: pick a FlashProxy location, switching to the FlashProxy source if needed. */
  | { type: 'connectVia'; location: Location }
  | { type: 'setUi'; ui: PopupUi }
  | { type: 'pickPlan'; planId: string }
  | { type: 'pickOwn'; proxyId: string }
  | { type: 'setSiteRule'; domain: string; rule: SiteRule | null }
  | { type: 'toggleFavourite'; cc: string }
  | { type: 'signIn'; connect: boolean }
  | { type: 'signInCancel' }
  | { type: 'signOut' }
  | { type: 'switchAccount' }
  | { type: 'takeBack' }
  | { type: 'open'; target: OpenTarget }
  | { type: 'refresh' };

export interface Toast {
  text: string;
  icon: string;
  color: string;
}

export interface Credentials {
  username: string;
  password: string;
}

/** What the Add/Edit proxy drawer and the console helper submit. */
export interface ProxyDraft {
  label: string;
  /** Existing provider id, or null to auto-detect from the host. */
  providerId: string | null;
  /** Name for a new provider (takes precedence over providerId). */
  newProvider?: string | null;
  protocol: Protocol;
  endpoints: { host: string; port: number }[];
  strategy: PoolStrategy;
  username: string;
  password: string;
  tags: string[];
}

export type TestResult =
  | { ok: true; ms: number; exit: ExitInfo }
  | { ok: false; title: string; detail: string; short: string };
