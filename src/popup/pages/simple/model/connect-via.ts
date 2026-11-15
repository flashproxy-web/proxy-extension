import {
  countryPool,
  filterCountries,
  ownProxyMatches,
  proxyLatencyLabel,
  type Model,
} from '@/popup/entities/connection';
import { COLOR } from '@/popup/shared/config';
import type { RowSpec } from '@/popup/shared/ui/SheetRow';
import { send } from '@/shared/api/client';
import { countryName } from '@/shared/lib/countries';
import { latencyColor } from '@/shared/lib/format';
import { connectViaPlan } from '@/shared/lib/plans';
import type { Plan } from '@/shared/model';

export interface ViaSection {
  head: string;
  rows: RowSpec[];
}

function locationRow(model: Model, plan: Plan, code: string, close: () => void): RowSpec {
  const { snapshot } = model;
  const geo = snapshot.geo[code];
  const selected = !model.isOwn && model.location.cc === code;
  return {
    key: 'c' + code,
    title: countryName(code),
    subtitle: plan.cityTargeting
      ? geo?.cities.slice(0, 3).join(', ') || 'Any city'
      : `${plan.name} · country level`,
    lead: { flag: code },
    selected,
    check: selected,
    run: () => {
      close();
      if (selected && model.live) return;
      send({
        type: 'connectVia',
        location: {
          cc: code,
          city: plan.cityTargeting ? (geo?.cities[0] ?? null) : null,
          isp: 'any',
        },
      });
    },
  };
}

function locationSections(model: Model, query: string, close: () => void): ViaSection[] {
  const { snapshot } = model;
  const plan = connectViaPlan(snapshot);
  if (!model.signedIn || !plan || model.status === 'noplans') return [];
  const pool = filterCountries(countryPool(snapshot, plan), query);
  const favourites = snapshot.settings.favourites.filter((code) => pool.includes(code));
  const rest = pool.filter((code) => !favourites.includes(code));
  const toRow = (code: string) => locationRow(model, plan, code, close);
  const sections: ViaSection[] = [];
  if (favourites.length) sections.push({ head: 'Favourites', rows: favourites.map(toRow) });
  if (rest.length) {
    sections.push({
      head: favourites.length ? 'All locations' : 'FlashProxy locations',
      rows: rest.map(toRow),
    });
  }
  return sections;
}

function ownProxySection(model: Model, query: string, close: () => void): ViaSection[] {
  const { snapshot } = model;
  const providers = new Map(snapshot.providers.map((provider) => [provider.id, provider]));
  const rows: RowSpec[] = snapshot.ownProxies
    .map((proxy) => ({ proxy, provider: providers.get(proxy.providerId) }))
    .filter(({ proxy, provider }) => ownProxyMatches(proxy, provider, query))
    .map(({ proxy, provider }) => {
      const selected = model.isOwn && model.proxy?.id === proxy.id;
      return {
        key: 'o' + proxy.id,
        title: proxy.label,
        subtitle: `${provider?.name ?? 'Custom'} · ${proxy.protocol}`,
        lead: { flag: proxy.cc },
        trailing: proxyLatencyLabel(proxy),
        trailingColor: proxy.healthy === false ? COLOR.red : latencyColor(proxy.latency),
        selected,
        check: selected,
        run: () => {
          close();
          if (selected && model.live) return;
          send({ type: 'pickOwn', proxyId: proxy.id });
        },
      };
    });
  return rows.length ? [{ head: 'My proxies', rows }] : [];
}

/** Simple's one picker: FlashProxy locations (favourites first) and own proxies in one list. */
export function connectViaSections(model: Model, query: string, close: () => void): ViaSection[] {
  return [...locationSections(model, query, close), ...ownProxySection(model, query, close)];
}
