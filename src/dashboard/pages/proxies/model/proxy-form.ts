import { z } from 'zod';

import { MIN_POOL_ENDPOINTS, NEW_PROVIDER_PREFIX } from '@/dashboard/shared/config';
import { CUSTOM_PROVIDER, PORT_RANGE } from '@/shared/config';
import { detectProvider, isValidHost } from '@/shared/lib/ownProxies';
import type { OwnProxy, Provider, ProxyDraft } from '@/shared/model';

import type { FieldErrors } from 'react-hook-form';

export const proxyFormSchema = z
  .object({
    kind: z.enum(['single', 'pool']),
    endpoints: z.string(),
    strategy: z.enum(['round', 'random', 'latency', 'failover']),
    label: z.string(),
    host: z.string(),
    port: z.string(),
    /** Provider id, or "new:Name" for one detected from the host. */
    provider: z.string().nullable(),
    manual: z.boolean(),
    protocol: z.enum(['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5']),
    username: z.string(),
    password: z.string(),
    tags: z.array(z.string()),
  })
  .superRefine((values, ctx) => {
    if (values.kind === 'pool' && validEndpoints(values.endpoints).length < MIN_POOL_ENDPOINTS)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endpoints'],
        message: 'A pool needs at least two endpoints',
      });
    else if (!isValidProxy(values))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['host'],
        message: 'Add a host and a valid port first',
      });
  });

export type ProxyForm = z.infer<typeof proxyFormSchema>;

type Endpoint = { host: string; port: number };
type TargetFields = Pick<ProxyForm, 'kind' | 'endpoints' | 'host' | 'port'>;

const ENDPOINT_LINE = /^([a-z0-9.-]+\.[a-z0-9-]+):(\d{1,5})$/i;
const SCHEME = /^[a-z0-9]+:\/\//i;
const HOST_PORT = /^(?:[a-z0-9]+:\/\/)?([^\s:/@]+):(\d{1,5})$/i;

export const isPort = (port: number) => port >= PORT_RANGE.min && port <= PORT_RANGE.max;

export function parseEndpoints(text: string): (Endpoint | null)[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = ENDPOINT_LINE.exec(line.replace(SCHEME, ''));
      return match && isPort(+match[2]) ? { host: match[1].toLowerCase(), port: +match[2] } : null;
    });
}

const validEndpoints = (text: string) =>
  parseEndpoints(text).filter((endpoint): endpoint is Endpoint => !!endpoint);

export function splitHostPort(raw: string): { host: string; port: string | null } {
  const host = raw.trim();
  const match = HOST_PORT.exec(host);
  return match ? { host: match[1], port: match[2] } : { host, port: null };
}

export function proxyTarget(values: TargetFields): Endpoint {
  if (values.kind === 'pool') {
    const first = validEndpoints(values.endpoints)[0];
    return { host: first?.host ?? '', port: first?.port ?? 0 };
  }
  return { host: values.host, port: Number(values.port) };
}

export function isValidProxy(values: TargetFields): boolean {
  const { host, port } = proxyTarget(values);
  return (
    isValidHost(host.trim()) &&
    isPort(port) &&
    (values.kind !== 'pool' || validEndpoints(values.endpoints).length >= MIN_POOL_ENDPOINTS)
  );
}

export const newProviderName = (provider: string | null) =>
  provider?.startsWith(NEW_PROVIDER_PREFIX) ? provider.slice(NEW_PROVIDER_PREFIX.length) : null;

/** The provider a host belongs to, unless the user picked one by hand. */
export function autoProvider(
  host: string,
  manual: boolean,
  providers: Provider[]
): string | null | undefined {
  if (manual) return undefined;
  const detected = detectProvider(host);
  if (detected)
    return (
      providers.find((provider) => provider.name === detected.name)?.id ??
      NEW_PROVIDER_PREFIX + detected.name
    );
  return providers.find((provider) => provider.name === CUSTOM_PROVIDER.name)?.id ?? null;
}

export function toDraft(values: ProxyForm): ProxyDraft {
  const newProvider = newProviderName(values.provider);
  return {
    label: values.label,
    providerId: newProvider ? null : values.provider,
    newProvider,
    protocol: values.protocol,
    endpoints:
      values.kind === 'pool'
        ? validEndpoints(values.endpoints)
        : [{ host: values.host.trim().toLowerCase(), port: Number(values.port) }],
    strategy: values.strategy,
    username: values.username,
    password: values.password,
    tags: values.tags,
  };
}

export function formDefaults(editing: OwnProxy | undefined, providerId: string | null): ProxyForm {
  if (editing)
    return {
      kind: editing.endpoints.length > 1 ? 'pool' : 'single',
      endpoints: editing.endpoints
        .map((endpoint) => `${endpoint.host}:${endpoint.port}`)
        .join('\n'),
      strategy: editing.strategy,
      label: editing.label,
      host: editing.endpoints[0].host,
      port: String(editing.endpoints[0].port),
      provider: editing.providerId,
      manual: true,
      protocol: editing.protocol,
      username: '',
      password: '',
      tags: editing.tags.slice(),
    };
  return {
    kind: 'single',
    endpoints: '',
    strategy: 'round',
    label: '',
    host: '',
    port: '',
    provider: providerId,
    manual: !!providerId,
    protocol: 'HTTP',
    username: '',
    password: '',
    tags: [],
  };
}

export const firstFormError = (errors: FieldErrors<ProxyForm>) =>
  errors.endpoints?.message ?? errors.host?.message;

export const draftTestKey = ({ tags: _tags, ...values }: ProxyForm) => JSON.stringify(values);
