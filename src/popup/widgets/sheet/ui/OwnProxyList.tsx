import { ownProxyMatches, proxyLatencyLabel, usePopup } from '@/popup/entities/connection';
import { COLOR } from '@/popup/shared/config';
import { SheetCommand } from '@/popup/shared/ui/SheetCommand';
import { SheetRow, type RowSpec } from '@/popup/shared/ui/SheetRow';
import { send } from '@/shared/api/client';
import { latencyColor } from '@/shared/lib/format';
import type { OwnProxy, Provider } from '@/shared/model';

function proxySubtitle(proxy: OwnProxy, provider: Provider | undefined): string {
  const [endpoint] = proxy.endpoints;
  const poolSize = proxy.endpoints.length;
  const base = `${provider?.name ?? 'Custom'} · ${proxy.protocol} · ${endpoint.host}:${endpoint.port}`;
  return poolSize > 1 ? `${base} · pool of ${poolSize}` : base;
}

export function OwnProxyList() {
  const { snapshot, model, ui, setQuery, closeSheet } = usePopup();
  const query = ui.query.trim().toLowerCase();
  const providers = new Map(snapshot.providers.map((provider) => [provider.id, provider]));
  const pick = (proxy: OwnProxy) => {
    closeSheet();
    send({ type: 'pickOwn', proxyId: proxy.id });
  };
  const rows: RowSpec[] = snapshot.ownProxies
    .map((proxy) => ({ proxy, provider: providers.get(proxy.providerId) }))
    .filter(({ proxy, provider }) => ownProxyMatches(proxy, provider, query))
    .map(({ proxy, provider }) => ({
      key: proxy.id,
      title: proxy.label,
      subtitle: proxySubtitle(proxy, provider),
      lead: { flag: proxy.cc },
      trailing: proxyLatencyLabel(proxy),
      trailingColor: proxy.healthy ? latencyColor(proxy.latency) : COLOR.red,
      selected: model.isOwn && model.proxy?.id === proxy.id,
      run: () => pick(proxy),
    }));
  return (
    <SheetCommand
      query={ui.query}
      onQuery={setQuery}
      placeholder="Search by label, provider or host"
      hint={rows.length + ' shown'}
      empty={rows.length === 0 && !!query}
    >
      {rows.map((row) => (
        <SheetRow key={row.key} row={row} />
      ))}
    </SheetCommand>
  );
}
