import type { Snapshot } from '../model';

export const NOT_AVAILABLE = 'This isn’t available yet.';

export const EMPTY_SNAPSHOT: Snapshot = {
  settings: {
    theme: 'system',
    ui: 'simple',
    lastPlanId: null,
    mode: 'global',
    active: null,
    location: { cc: 'de', city: null, isp: 'any' },
    session: 'sticky',
    siteRules: {},
    favourites: ['de', 'us', 'gb', 'nl'],
    wantOn: false,
  },
  account: null,
  plans: [],
  geo: {},
  providers: [],
  ownProxies: [],
  rules: [],
  runtime: {
    status: 'off',
    exit: null,
    latency: null,
    sessionId: '',
    sessionExpiresAt: null,
    poolIdx: 0,
    realIp: null,
    conflictName: null,
    testing: [],
    testRun: null,
    signin: null,
  },
};
