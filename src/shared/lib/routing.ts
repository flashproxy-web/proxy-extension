import type { Mode, Rule, RuleType, SiteRule } from '../model';

export type Route =
  | { source: 'site'; domain: string; action: SiteRule }
  | { source: 'rule'; index: number; rule: Rule }
  | { source: 'default' };

export const RULE_TYPE_LABEL: Readonly<Record<RuleType, string>> = {
  wildcard: 'Wildcard',
  domain: 'Domain + subdomains',
  regex: 'Regex · full URL',
  cidr: 'IP range',
};

const DEFAULT_ROUTE: Route = { source: 'default' };

export const siteKey = (host: string): string => host.toLowerCase().replace(/^www\./, '');

export function ruleType(pattern: string): RuleType {
  if (/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(pattern)) return 'cidr';
  if (pattern.startsWith('^') || /[\\()[\]|$+]/.test(pattern)) return 'regex';
  if (pattern.includes('*')) return 'wildcard';
  return 'domain';
}

export function matchRule(type: RuleType, pattern: string, url: string, host: string): boolean {
  const h = host.toLowerCase();
  const wildcard = (value: string) =>
    new RegExp('^' + value.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i');
  const ipNumber = (ip: string) => ip.split('.').reduce((total, octet) => total * 256 + Number(octet), 0);
  try {
    if (type === 'regex') return new RegExp(pattern, 'i').test(url);
    if (type === 'wildcard') return wildcard(pattern).test(h) || (pattern.indexOf('*.') === 0 && wildcard(pattern.slice(2)).test(h));
    if (type === 'cidr') {
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(h)) return false;
      const [network, size] = pattern.split('/');
      const bits = Number(size);
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      return ((ipNumber(h) & mask) >>> 0) === ((ipNumber(network) & mask) >>> 0);
    }
    const domain = pattern.toLowerCase();
    return h === domain || h.slice(-domain.length - 1) === '.' + domain;
  } catch {
    return false;
  }
}

export const pacUrl = (url: URL): string =>
  url.protocol === 'https:' || url.protocol === 'wss:' ? `${url.protocol}//${url.host}/` : url.href;

export function siteRuleFor(host: string, siteRules: Record<string, SiteRule>): [string, SiteRule] | null {
  const found = Object.entries(siteRules).find(([domain]) => matchRule('domain', domain, '', host));
  return found ?? null;
}

export function evaluate(url: URL, siteRules: Record<string, SiteRule>, rules: Rule[]): Route {
  const site = siteRuleFor(url.hostname, siteRules);
  if (site) return { source: 'site', domain: site[0], action: site[1] };
  const href = pacUrl(url);
  const index = rules.findIndex((rule) => rule.enabled && matchRule(rule.type, rule.pattern, href, url.hostname));
  return index < 0 ? DEFAULT_ROUTE : { source: 'rule', index, rule: rules[index] };
}

export function routeFor(url: URL, mode: Mode, siteRules: Record<string, SiteRule>, rules: Rule[]): { proxied: boolean; route: Route } {
  if (mode === 'direct' || mode === 'system') return { proxied: false, route: DEFAULT_ROUTE };
  const route = evaluate(url, siteRules, mode === 'smart' ? rules : []);
  if (route.source === 'site') return { proxied: route.action === 'proxy', route };
  if (route.source === 'rule') return { proxied: route.rule.target.kind === 'fp' || route.rule.target.kind === 'own', route };
  return { proxied: mode === 'global', route };
}
