import { z } from 'zod';

import { matchRule } from '@/shared/lib/routing';
import type { Mode, SiteRule } from '@/shared/model';

export const serverSchema = z.object({
  scheme: z.enum(['http', 'https', 'socks4', 'socks5']),
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
});
export type Server = z.infer<typeof serverSchema>;

const routeTargetSchema = z.union([z.array(serverSchema), z.literal('direct'), z.literal('block')]);
export type RouteTarget = z.infer<typeof routeTargetSchema>;

export const ruleRouteSchema = z.object({
  type: z.enum(['domain', 'wildcard', 'regex', 'cidr']),
  pattern: z.string(),
  target: routeTargetSchema,
});
export type RuleRoute = z.infer<typeof ruleRouteSchema>;

export interface Routing {
  mode: Mode;
  siteRules: Record<string, SiteRule>;
  rules: RuleRoute[];
}

export const PAC = {
  direct: 'DIRECT',
  block: 'PROXY 127.0.0.1:9',
  proxy: { http: 'PROXY', https: 'HTTPS', socks4: 'SOCKS', socks5: 'SOCKS5' },
} as const;

const literal = (value: string) => JSON.stringify(value);

export const pacTarget = (proxy: Server) =>
  `${PAC.proxy[proxy.scheme]} ${proxy.host}:${proxy.port}`;

export function domainsFor(siteRules: Record<string, SiteRule>, rule: SiteRule) {
  return Object.entries(siteRules)
    .filter(([, value]) => value === rule)
    .map(([domain]) => domain);
}

function hostMatch(hosts: readonly string[], result: string): string {
  return `var hosts = ${JSON.stringify(hosts)};
  for (var i = 0; i < hosts.length; i++) {
    if (host === hosts[i] || dnsDomainIs(host, '.' + hosts[i])) return ${literal(result)};
  }`;
}

function routeTarget(target: RouteTarget): string {
  if (target === 'direct') return PAC.direct;
  if (target === 'block') return PAC.block;
  return target.map(pacTarget).join('; ');
}

function smartBody(
  proxy: Server,
  { siteRules, rules }: Routing,
  forcedHosts: readonly string[]
): string {
  const sites = Object.entries(siteRules).map(([domain, rule]) => [
    domain,
    rule === 'proxy' ? pacTarget(proxy) : PAC.direct,
  ]);
  const routes = rules.map((rule) => [rule.type, rule.pattern, routeTarget(rule.target)]);
  return `var match = ${matchRule.toString()};
  ${hostMatch(forcedHosts, pacTarget(proxy))}
  var sites = ${JSON.stringify(sites)};
  for (var s = 0; s < sites.length; s++) {
    if (match('domain', sites[s][0], url, host)) return sites[s][1];
  }
  var rules = ${JSON.stringify(routes)};
  for (var r = 0; r < rules.length; r++) {
    if (match(rules[r][0], rules[r][1], url, host)) return rules[r][2];
  }
  return ${literal(PAC.direct)};`;
}

function pacBody(proxy: Server | null, routing: Routing, forcedHosts: readonly string[]): string {
  if (!proxy) return `return ${literal(PAC.direct)};`;
  if (routing.mode === 'smart') return smartBody(proxy, routing, forcedHosts);
  return `if (isPlainHostName(host)) return ${literal(PAC.direct)};
  ${hostMatch(domainsFor(routing.siteRules, 'direct'), PAC.direct)}
  return ${literal(pacTarget(proxy))};`;
}

const wrap = (body: string) => `function FindProxyForURL(url, host) {\n  ${body}\n}`;

export const pacScript = (proxy: Server | null, routing: Routing, forcedHosts: readonly string[]) =>
  wrap(pacBody(proxy, routing, forcedHosts));

export const testPacScript = (
  server: Server,
  testHost: string,
  applied: Server | null,
  routing: Routing,
  forcedHosts: readonly string[]
) =>
  wrap(
    `if (host === ${literal(testHost)}) return ${literal(pacTarget(server))};\n  ${pacBody(applied, routing, forcedHosts)}`
  );
