import {
  BookOpen,
  House,
  ListFilter,
  Monitor,
  Moon,
  Radio,
  Server,
  Settings,
  Smartphone,
  Sun,
  type LucideIcon,
} from 'lucide-react';

import { AUTO_PROVIDER_ID, FP_LINKS } from '@/shared/config';
import {
  type PlanKind,
  type PoolStrategy,
  type PopupUi,
  type Protocol,
  type Theme,
} from '@/shared/model';

import type { Option, Page } from '../model';

export const TOAST_ID = 'dash';
export const WORKER_ERROR_CODE = 'ERR_WORKER_UNREACHABLE';

export const WORKER_TIMEOUT_MS = 6000;
export const TOAST_MS = 2600;
export const UNDO_TOAST_MS = 5000;
export const AUTO_TEST_DELAY_MS = 400;

export const MIN_POOL_ENDPOINTS = 2;
export const SLOW_LATENCY_MS = 200;
export const LOW_BANDWIDTH_PCT = 10;

export const NARROW_VW = 1000;
export const CONN_PILL_VW = 760;
export const PLANS_TWO_COL_VW = 1180;
export const PROVIDER_DOMAIN_VW = 1100;
export const IMPORT_TWO_COL_VW = 900;

export const PAGES: readonly { page: Page; label: string; icon: LucideIcon }[] = [
  { page: 'proxies', label: 'Proxies', icon: Server },
  { page: 'rules', label: 'Rules', icon: ListFilter },
  { page: 'settings', label: 'Settings', icon: Settings },
];
export const EXTERNAL_PAGES: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: FP_LINKS.apiDocs, label: 'API docs', icon: BookOpen },
];
export const PAGE_BY_ID = new Map(PAGES.map((entry) => [entry.page, entry]));

export const LOADING_LABEL: Record<Page, string> = {
  proxies: 'Unlocking your proxy library…',
  rules: 'Loading rules…',
  settings: 'Loading settings…',
};

export const THEME_ICON: Record<Theme, LucideIcon> = { system: Monitor, dark: Moon, light: Sun };
export const NEXT_THEME: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
export const THEME_OPTIONS: readonly Option<Theme>[] = [
  ['system', 'System'],
  ['light', 'Light'],
  ['dark', 'Dark'],
];

export const LAYOUT_OPTIONS: readonly Option<PopupUi>[] = [
  ['simple', 'Simple'],
  ['pro', 'Pro'],
];

export const PLAN_ICONS: Record<PlanKind, LucideIcon> = {
  res: House,
  isp: Radio,
  dc: Server,
  mob: Smartphone,
};

export const STRATEGY_TEXT: Record<PoolStrategy, string> = {
  round: 'Each new connection goes to the next healthy endpoint, in order.',
  random: 'Each new connection goes to a random healthy endpoint.',
  latency: 'Always uses the fastest healthy endpoint. Re-checked every 60 seconds.',
  failover: 'Uses the first endpoint and moves down the list only when it fails.',
};
export const STRATEGIES: readonly Option<PoolStrategy>[] = [
  ['round', 'Round-robin'],
  ['random', 'Random'],
  ['latency', 'Lowest latency'],
  ['failover', 'Failover'],
];

export const PROTOCOLS: readonly Option<Protocol>[] = [
  ['HTTP', 'HTTP'],
  ['HTTPS', 'HTTPS'],
  ['SOCKS4', 'SOCKS4'],
  ['SOCKS5', 'SOCKS5'],
];
export type ProtocolFilter = 'all' | Protocol;
export const PROTOCOL_FILTERS: readonly Option<ProtocolFilter>[] = [
  ['all', 'All'],
  ['HTTP', 'HTTP'],
  ['HTTPS', 'HTTPS'],
  ['SOCKS5', 'SOCKS5'],
];
export type HealthFilter = 'all' | 'ok' | 'bad';
export const HEALTH_FILTERS: readonly Option<HealthFilter>[] = [
  ['all', 'Any health'],
  ['ok', 'Healthy'],
  ['bad', 'Failing'],
];

export const PROXY_KINDS: readonly Option<'single' | 'pool'>[] = [
  ['single', 'Single proxy'],
  ['pool', 'Pool of endpoints'],
];

export type ImportMode = 'separate' | 'pool';
export const IMPORT_MODES: readonly Option<ImportMode>[] = [
  ['separate', 'Separate proxies'],
  ['pool', 'One pool'],
];
export const AUTO_PROVIDER = {
  id: AUTO_PROVIDER_ID,
  name: 'Auto-detect',
  color: 'var(--accent)',
  initial: '✦',
} as const;
export const NEW_PROVIDER_PREFIX = 'new:';

export const IMPORT_FORMATS = [
  'host:port',
  'host:port:user:pass',
  'user:pass@host:port',
  'http://user:pass@host:port',
];

export const PROXY_COLUMNS = [
  { key: 'label', label: 'Label', className: 'pl-12.5' },
  { key: 'host', label: 'Host : port', className: 'w-44' },
  { key: 'protocol', label: 'Protocol', className: 'w-20' },
  { key: 'auth', label: 'Auth', className: 'w-32' },
  { key: 'country', label: 'Country', className: 'w-20' },
  { key: 'health', label: 'Health', className: 'w-28' },
  { key: 'checked', label: 'Checked', className: 'w-24' },
  { key: 'actions', label: '', className: 'w-20 pr-3.5' },
] as const;
export const IMPORT_COLUMNS = [
  { key: 'line', label: '#', className: 'w-10' },
  { key: 'host', label: 'Host', className: '' },
  { key: 'port', label: 'Port', className: 'w-16' },
  { key: 'user', label: 'User', className: 'w-1/5' },
  { key: 'status', label: 'Status', className: 'w-1/3' },
] as const;
