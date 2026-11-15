import vm from 'node:vm';

import {
  PAC,
  pacScript,
  pacTarget,
  testPacScript,
  type RuleRoute,
  type Routing,
  type Server,
} from '../src/background/pac';
import { evaluate, pacUrl, ruleType } from '../src/shared/lib/routing';

import type { Rule, RuleTarget, SiteRule } from '../src/shared/model';

const server = (host: string, port: number, scheme: Server['scheme'] = 'http'): Server => ({
  scheme,
  host,
  port,
  username: '',
  password: '',
});

const ACTIVE = server('active.example', 8080);
const OWN = server('own.example', 1);
const POOL = [
  server('p1.example', 1),
  server('p2.example', 2, 'https'),
  server('p3.example', 3, 'socks5'),
];
const TESTED = server('tested.example', 9999);
const FORCED = ['ipinfo.io', 'cp.cloudflare.com'];
const TEST_HOST = 'api.country.is';

const rule = (pattern: string, target: RuleTarget, enabled = true): Rule => ({
  id: pattern,
  pattern,
  type: ruleType(pattern),
  target,
  enabled,
});
const rules: Rule[] = [
  rule('*.amazon.*', { kind: 'own', proxyId: 'own' }),
  rule('google.com', { kind: 'direct' }),
  rule('^https://(www\\.)?instagram\\.com/', { kind: 'own', proxyId: 'pool' }),
  rule('10.0.0.0/8', { kind: 'direct' }),
  rule('*.doubleclick.net', { kind: 'block' }),
  rule('*.zalando.*', { kind: 'own', proxyId: 'own' }, false),
];
const siteRules: Record<string, SiteRule> = { 'netflix.com': 'direct', 'example.org': 'proxy' };

const serversFor = (target: RuleTarget): RuleRoute['target'] => {
  if (target.kind === 'direct' || target.kind === 'block') return target.kind;
  return target.kind === 'own' && target.proxyId === 'pool' ? POOL : [OWN];
};

const routes: RuleRoute[] = rules
  .filter((item) => item.enabled)
  .map((item) => ({ type: item.type, pattern: item.pattern, target: serversFor(item.target) }));

const expectedTarget = (target: RuleRoute['target']) =>
  target === 'direct'
    ? PAC.direct
    : target === 'block'
      ? PAC.block
      : target.map(pacTarget).join('; ');

function compile(script: string) {
  const context = vm.createContext({
    isPlainHostName: (host: string) => !host.includes('.'),
    dnsDomainIs: (host: string, domain: string) => host.endsWith(domain),
    FindProxyForURL: null,
  });
  vm.runInContext(script, context);
  const find: unknown = context.FindProxyForURL;
  if (typeof find !== 'function') throw new Error('PAC script has no FindProxyForURL');
  return (href: string) => {
    const url = new URL(href);
    return String(find(pacUrl(url), url.hostname));
  };
}

function smartExpectation(href: string): string {
  const url = new URL(href);
  if (FORCED.includes(url.hostname)) return pacTarget(ACTIVE);
  const route = evaluate(url, siteRules, rules);
  if (route.source === 'site') return route.action === 'proxy' ? pacTarget(ACTIVE) : PAC.direct;
  if (route.source === 'rule') return expectedTarget(serversFor(route.rule.target));
  return PAC.direct;
}

function globalExpectation(href: string): string {
  const url = new URL(href);
  if (!url.hostname.includes('.')) return PAC.direct;
  const site = evaluate(url, siteRules, []);
  return site.source === 'site' && site.action === 'direct' ? PAC.direct : pacTarget(ACTIVE);
}

const URLS = [
  'https://www.amazon.de/dp/1',
  'https://amazon.com/',
  'https://google.com/search?q=x',
  'https://mail.google.com/',
  'https://www.instagram.com/p/abc',
  'https://instagram.com/',
  'http://10.0.0.12:8080/admin',
  'http://11.0.0.1/',
  'https://ad.doubleclick.net/pixel',
  'https://www.zalando.de/',
  'https://www.netflix.com/',
  'https://example.org/',
  'https://ipinfo.io/json',
  'http://intranet/',
];

let failures = 0;
function check(name: string, got: string, want: string) {
  const ok = got === want;
  if (!ok) failures++;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(48)} → ${got}${ok ? '' : `   (expected ${want})`}`
  );
}

const smart: Routing = { mode: 'smart', siteRules, rules: routes };
const global: Routing = { mode: 'global', siteRules, rules: [] };
const findSmart = compile(pacScript(ACTIVE, smart, FORCED));
const findGlobal = compile(pacScript(ACTIVE, global, FORCED));
for (const href of URLS) check(`smart  ${href}`, findSmart(href), smartExpectation(href));
for (const href of URLS) check(`global ${href}`, findGlobal(href), globalExpectation(href));

const findIdle = compile(pacScript(null, smart, FORCED));
check('no proxy → direct', findIdle('https://example.com/'), PAC.direct);

const findTest = compile(testPacScript(TESTED, TEST_HOST, ACTIVE, smart, FORCED));
check(
  'test host goes through the proxy under test',
  findTest(`https://${TEST_HOST}/`),
  pacTarget(TESTED)
);
check(
  'test keeps the active routing for other hosts',
  findTest('https://example.org/'),
  pacTarget(ACTIVE)
);

const hostile = server(`evil.example'; return 'DIRECT'; //`, 80);
const hostileSite: Record<string, SiteRule> = { [`x.com"]; globalThis.pwned = 1; //`]: 'direct' };
const injected = vm.createContext({
  isPlainHostName: () => false,
  dnsDomainIs: () => false,
  pwned: 0,
});
const runHostile = (mode: Routing['mode']) => {
  vm.runInContext(
    pacScript(hostile, { mode, siteRules: hostileSite, rules: [] }, FORCED),
    injected
  );
  const find: unknown = injected.FindProxyForURL;
  return typeof find === 'function' ? String(find('https://a.b/', 'a.b')) : 'no function';
};
check('hostile host stays inside its string (global)', runHostile('global'), pacTarget(hostile));
check('hostile host stays inside its string (smart)', runHostile('smart'), PAC.direct);
check('hostile site rule cannot run code', String(injected.pwned), '0');

console.log(failures ? `\n${failures} FAILED` : '\nall agree');
process.exit(failures ? 1 : 0);
