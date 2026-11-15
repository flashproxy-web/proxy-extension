import { CUSTOM_PROVIDER, NO_AUTH_PROTOCOLS, PORT_RANGE } from '../config';

import type { Protocol } from '../model';

export type DetectedProvider = { name: string; domain: string; color: string };

export type ImportLine =
  | { raw: string; host: string; port: number; user: string; pass: string; proto: Protocol; det: DetectedProvider | null; warn: string }
  | { raw: string; host?: string; port?: string; user?: string; err: string };

export const SWATCHES = ['#2563EB', '#0891B2', '#16A34A', '#D97706', '#DC2626', '#DB2777', '#7F50FF', CUSTOM_PROVIDER.color] as const;

const KNOWN_PROVIDERS: readonly (readonly [RegExp, DetectedProvider])[] = [
  [/superproxy\.io|brightdata|luminati|lum-superproxy/i, { name: 'Bright Data', domain: 'superproxy.io', color: '#2563EB' }],
  [/oxylabs/i, { name: 'Oxylabs', domain: 'oxylabs.io', color: '#0891B2' }],
  [/smartproxy|decodo/i, { name: 'Smartproxy', domain: 'smartproxy.com', color: '#16A34A' }],
  [/iproyal/i, { name: 'IPRoyal', domain: 'iproyal.com', color: '#D97706' }],
  [/webshare/i, { name: 'Webshare', domain: 'webshare.io', color: '#DB2777' }],
  [/soax/i, { name: 'SOAX', domain: 'soax.com', color: '#DC2626' }],
  [/netnut/i, { name: 'NetNut', domain: 'netnut.io', color: '#7F50FF' }],
  [/flashproxy\.(io|com)/i, { name: 'FlashProxy', domain: 'flashproxy.io', color: '#7F50FF' }],
];

const SCHEME = /^(https?|socks4|socks5h?):\/\//i;
const HOST = /^[a-z0-9.-]+$/i;

export const isValidHost = (host: string) => HOST.test(host) && host.includes('.');

export function detectProvider(host: string): DetectedProvider | null {
  return KNOWN_PROVIDERS.find(([pattern]) => pattern.test(host))?.[1] ?? null;
}

function splitLine(rest: string): { host: string; port: string; user: string; pass: string } | string {
  if (rest.includes('@')) {
    const at = rest.lastIndexOf('@');
    const login = rest.slice(0, at);
    const target = rest.slice(at + 1).split(':');
    const colon = login.indexOf(':');
    if (colon < 0) return 'Missing password after the username';
    if (target.length !== 2) return 'Expected host:port after @';
    return { host: target[0], port: target[1], user: login.slice(0, colon), pass: login.slice(colon + 1) };
  }
  const parts = rest.split(':');
  if (parts.length === 2) return { host: parts[0], port: parts[1], user: '', pass: '' };
  if (parts.length === 4) return { host: parts[0], port: parts[1], user: parts[2], pass: parts[3] };
  return parts.length === 3 ? 'Missing password (host:port:user:pass)' : 'Unrecognised format';
}

export function parseImportLine(raw: string): ImportLine | null {
  const line = raw.trim();
  if (!line || line.startsWith('#')) return null;
  const scheme = SCHEME.exec(line);
  const proto = (scheme ? scheme[1].toUpperCase().replace('SOCKS5H', 'SOCKS5') : 'HTTP') as Protocol;
  const parts = splitLine(line.slice(scheme?.[0].length ?? 0).replace(/\/$/, ''));
  if (typeof parts === 'string') return { raw: line, err: parts };
  const { host, port, user, pass } = parts;
  if (!isValidHost(host)) return { raw: line, err: 'Invalid host' };
  const portNumber = Number(port);
  if (!/^\d+$/.test(port) || portNumber < PORT_RANGE.min || portNumber > PORT_RANGE.max) {
    return { raw: line, host, port, user, err: `Port must be ${PORT_RANGE.min}–${PORT_RANGE.max}` };
  }
  return {
    raw: line,
    host: host.toLowerCase(),
    port: portNumber,
    user,
    pass,
    proto,
    det: detectProvider(host),
    warn: NO_AUTH_PROTOCOLS.includes(proto) && user ? 'SOCKS login won’t work in Chrome' : '',
  };
}
