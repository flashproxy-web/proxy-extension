import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { z } from 'zod';

import type { SessionType } from '@/shared/model';

import { API_CODE, FP_API, FP_API_PATH, PLAN_PAGE_SIZE } from '../config';

import { readApiKey } from './apiKey';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
  }

  get label() {
    return this.status ? `${this.code} · ${this.status}` : this.code;
  }
}

const envelopeSchema = z.union([
  z.object({ success: z.literal(true), data: z.unknown() }),
  z.object({ success: z.literal(false), error: z.object({ code: z.string(), message: z.string() }) }),
]);

const meSchema = z.object({ email: z.string().nullable(), name: z.string().nullable() });

const keySchema = z.object({ permissions: z.array(z.string()) });

const apiPlanSchema = z.object({
  plan_id: z.string(),
  product: z.string(),
  name: z.string().nullable(),
  status: z.string(),
  expires_at: z.string().nullable(),
  max_bytes: z.number().nullable(),
  bytes_used: z.number().nullable(),
});
export type ApiPlan = z.infer<typeof apiPlanSchema>;

const planPageSchema = z.object({ plans: z.array(apiPlanSchema), total: z.number() });

const locationsSchema = z.object({
  any_country: z.boolean(),
  countries: z.array(z.object({ code: z.string(), name: z.string() })).nullable(),
});

const proxiesSchema = z.object({ proxies: z.array(z.string()).min(1) });

export interface FpProxy {
  scheme: 'http' | 'https';
  host: string;
  port: number;
  username: string;
  password: string;
}

const PROXY_SCHEMES: readonly FpProxy['scheme'][] = ['http', 'https'];

async function send(config: AxiosRequestConfig, key: string | null): Promise<AxiosResponse> {
  const apiKey = key ?? (await readApiKey());
  if (!apiKey) throw new ApiError(401, API_CODE.unauthorized, 'No API key');
  try {
    return await axios({ ...config, url: FP_API + config.url, headers: { Authorization: `Bearer ${apiKey}` }, validateStatus: null });
  } catch (error) {
    throw new ApiError(0, API_CODE.network, error instanceof Error ? error.message : String(error));
  }
}

/** `key` checks a key before it is saved; otherwise the saved key is used. */
async function request<T>(schema: z.ZodType<T>, config: AxiosRequestConfig, key: string | null = null): Promise<T> {
  const res = await send(config, key);
  const envelope = envelopeSchema.safeParse(res.data);
  if (!envelope.success) throw new ApiError(res.status, API_CODE.badResponse, res.statusText);
  if (!envelope.data.success) {
    const { code, message } = envelope.data.error;
    throw new ApiError(res.status, code, message);
  }
  const data = schema.safeParse(envelope.data.data);
  if (!data.success) throw new ApiError(res.status, API_CODE.badResponse, data.error.message);
  return data.data;
}

export const fetchMe = () => request(meSchema, { url: FP_API_PATH.me });

export const fetchKeyPermissions = async (key: string) =>
  (await request(keySchema, { url: FP_API_PATH.key }, key)).permissions;

export async function fetchPlans(): Promise<ApiPlan[]> {
  const plans: ApiPlan[] = [];
  for (;;) {
    const params = { status: 'all', limit: PLAN_PAGE_SIZE, offset: plans.length };
    const page = await request(planPageSchema, { url: FP_API_PATH.plans, params });
    plans.push(...page.plans);
    if (!page.plans.length || plans.length >= page.total) return plans;
  }
}

export async function fetchCountries(planId: string): Promise<string[] | null> {
  const loc = await request(locationsSchema, { url: FP_API_PATH.locations(planId) });
  if (loc.any_country || !loc.countries) return null;
  return loc.countries.map((country) => country.code.toLowerCase());
}

export async function fetchProxy(
  planId: string,
  target: { cc: string | null; session: SessionType; stickyMinutes: number }
): Promise<FpProxy> {
  const body = {
    count: 1,
    country: target.cc?.toUpperCase() ?? null,
    session: target.session,
    sticky_minutes: target.stickyMinutes,
    protocol: 'http',
    format: 'url',
  };
  const { proxies } = await request(proxiesSchema, { method: 'POST', url: FP_API_PATH.proxies(planId), data: body });
  const url = new URL(proxies[0]);
  const scheme = url.protocol.replace(':', '') as FpProxy['scheme'];
  if (!PROXY_SCHEMES.includes(scheme) || !url.port) throw new ApiError(200, API_CODE.badResponse, proxies[0]);
  return {
    scheme,
    host: url.hostname,
    port: Number(url.port),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}
