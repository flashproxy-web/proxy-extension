import { z } from 'zod';

import type { Location, Plan, PlanKind } from '@/shared/model';

import { ApiError, fetchCountries, type ApiPlan } from './api/flashproxy';
import { API_CODE, BYTES_PER_GB, LOCATIONS_TTL_MS, STORAGE_KEY } from './config';

const KIND_BY_PRODUCT: Readonly<Record<string, PlanKind>> = {
  'dedicated-isp': 'isp',
  'dedicated-isp-subnet': 'isp',
  'dedicated-isp-v2': 'isp',
  'dedicated-mobile': 'mob',
  mobile: 'mob',
  mobile_usa: 'mob',
  datacenter: 'dc',
  'ipv6-datacenter': 'dc',
  ipv6_datacenter: 'dc',
};

const PRODUCT_NAME: Readonly<Record<string, string>> = {
  residential: 'Residential',
  'hq-residential': 'HQ Residential',
  'residential-lite': 'Residential Lite',
  'unlimited-residential': 'Unlimited Residential',
  unlimited_residential: 'Unlimited Residential',
  premium_unl_resi: 'Premium Unlimited Residential',
  'ipv6-residential': 'IPv6 Residential',
  ipv6_residential: 'IPv6 Residential',
  'ipv6-datacenter': 'IPv6 Datacenter',
  ipv6_datacenter: 'IPv6 Datacenter',
  datacenter: 'Datacenter',
  isp: 'ISP',
  isp_eu: 'ISP EU',
  mobile: 'Mobile',
  mobile_usa: 'Mobile USA',
};

const IPV6_PRODUCTS: ReadonlySet<string> = new Set([
  'ipv6-residential',
  'ipv6_residential',
  'ipv6-datacenter',
  'ipv6_datacenter',
]);

const PLAN_STATUS: Readonly<Record<string, Plan['status']>> = {
  active: 'active',
  expired: 'expired',
};

const NO_GATEWAY: Plan['gateway'] = { host: '', port: 0, scheme: 'http' };

const locationEntrySchema = z.object({
  at: z.number(),
  countries: z.array(z.string()).nullable(),
  unsupported: z.boolean(),
});
type LocationEntry = z.infer<typeof locationEntrySchema>;

const locationCacheSchema = z.record(locationEntrySchema);
export type LocationCache = z.infer<typeof locationCacheSchema>;

const kindOf = (product: string): PlanKind =>
  KIND_BY_PRODUCT[product] ?? (product.includes('isp') ? 'isp' : 'res');

export const isListedPlan = (plan: ApiPlan) => plan.status in PLAN_STATUS;

export function toPlan(plan: ApiPlan, previous?: Plan): Plan {
  const status = PLAN_STATUS[plan.status];
  const metered = plan.max_bytes !== null && plan.bytes_used !== null;
  return {
    id: plan.plan_id,
    kind: kindOf(plan.product),
    name: plan.name ?? PRODUCT_NAME[plan.product] ?? plan.product,
    gbTotal: metered ? plan.max_bytes! / BYTES_PER_GB : 0,
    gbLeft: metered ? Math.max(0, plan.max_bytes! - plan.bytes_used!) / BYTES_PER_GB : null,
    status,
    renewsAt: status === 'active' ? (plan.expires_at ?? undefined) : undefined,
    expiredAt: status === 'expired' ? (plan.expires_at ?? undefined) : undefined,
    countries: previous?.countries ?? null,
    cityTargeting: false,
    ipv6: IPV6_PRODUCTS.has(plan.product),
    gateway: previous?.gateway ?? NO_GATEWAY,
  };
}

export function validLocation(plan: Plan, location: Location): Location {
  if (!plan.countries || plan.countries.includes(location.cc)) return location;
  return { cc: plan.countries[0] ?? location.cc, city: null, isp: 'any' };
}

const unsupported = (error: unknown) =>
  error instanceof ApiError && error.code === API_CODE.proxiesNotSupported;

export async function readLocationCache(): Promise<LocationCache> {
  const stored = await chrome.storage.local.get(STORAGE_KEY.locations);
  const parsed = locationCacheSchema.safeParse(stored[STORAGE_KEY.locations]);
  return parsed.success ? parsed.data : {};
}

export const saveLocationCache = (cache: LocationCache) =>
  chrome.storage.local.set({ [STORAGE_KEY.locations]: cache });

async function locationsFor(
  planId: string,
  cached: LocationEntry | undefined
): Promise<LocationEntry | null> {
  const now = Date.now();
  if (cached && now - cached.at < LOCATIONS_TTL_MS) return cached;
  try {
    const countries = await fetchCountries(planId);
    if (countries && !countries.length) return null;
    return { at: now, countries, unsupported: false };
  } catch (error) {
    if (unsupported(error)) return { at: now, countries: null, unsupported: true };
    return cached ?? null;
  }
}

export async function resolvePlan(
  apiPlan: ApiPlan,
  previous: Plan | undefined,
  cached: LocationEntry | undefined
): Promise<{ plan: Plan | null; entry: LocationEntry | null }> {
  const base = toPlan(apiPlan, previous);
  const entry = await locationsFor(apiPlan.plan_id, cached);
  if (entry?.unsupported) return { plan: null, entry };
  return { plan: { ...base, countries: entry ? entry.countries : null }, entry };
}
