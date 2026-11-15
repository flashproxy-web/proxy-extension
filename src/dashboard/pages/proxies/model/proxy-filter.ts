import type { HealthFilter, ProtocolFilter } from '@/dashboard/shared/config';
import type { OwnProxy, Provider } from '@/shared/model';

export interface ProxyFilterState {
  search: string;
  protocol: ProtocolFilter;
  health: HealthFilter;
}

interface ProviderGroupView {
  provider: Provider;
  proxies: OwnProxy[];
  visible: OwnProxy[];
}

export const NO_FILTER: ProxyFilterState = { search: '', protocol: 'all', health: 'all' };

export const isFiltering = (filter: ProxyFilterState) =>
  !!filter.search.trim() || filter.protocol !== 'all' || filter.health !== 'all';

const searchText = (proxy: OwnProxy) =>
  `${proxy.label} ${proxy.endpoints.map((endpoint) => `${endpoint.host}:${endpoint.port}`).join(' ')} ${proxy.tags.join(' ')}`.toLowerCase();

export function proxyMatcher(filter: ProxyFilterState) {
  const query = filter.search.trim().toLowerCase();
  return (proxy: OwnProxy) =>
    (!query || searchText(proxy).includes(query)) &&
    (filter.protocol === 'all' || proxy.protocol === filter.protocol) &&
    (filter.health === 'all' || (filter.health === 'ok' ? proxy.healthy : !proxy.healthy));
}

export function groupByProvider(
  providers: Provider[],
  proxies: OwnProxy[],
  filter: ProxyFilterState
): ProviderGroupView[] {
  const byProvider = new Map<string, OwnProxy[]>();
  for (const proxy of proxies)
    byProvider.set(proxy.providerId, [...(byProvider.get(proxy.providerId) ?? []), proxy]);
  const matches = proxyMatcher(filter);
  return providers
    .map((provider) => ({ provider, proxies: byProvider.get(provider.id) ?? [] }))
    .filter((group) => group.proxies.length > 0)
    .map((group) => ({ ...group, visible: group.proxies.filter(matches) }));
}
