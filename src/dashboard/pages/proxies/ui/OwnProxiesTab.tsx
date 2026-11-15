import { plural } from '@/dashboard/shared/lib/format';
import { toggled } from '@/dashboard/shared/lib/sets';
import { useDashboard } from '@/dashboard/shared/model';
import { call } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

import { useProxiesPage } from '../model/proxies-page-context';
import {
  NO_FILTER,
  groupByProvider,
  isFiltering,
  type ProxyFilterState,
} from '../model/proxy-filter';

import { OwnProxiesEmpty } from './OwnProxiesEmpty';
import { ProviderGroup } from './ProviderGroup';
import { ProxyFilters } from './ProxyFilters';
import { TestRunBar } from './TestRunBar';
import { TrustNote } from './TrustNote';

export function OwnProxiesTab({
  filter,
  onFilterChange,
  closed,
  onClosedChange,
}: {
  filter: ProxyFilterState;
  onFilterChange: (filter: ProxyFilterState) => void;
  closed: ReadonlySet<string>;
  onClosedChange: (closed: ReadonlySet<string>) => void;
}) {
  const { snapshot } = useDashboard();
  const { addProxy, openImport } = useProxiesPage();

  const proxies = snapshot.ownProxies;
  if (!proxies.length) return <OwnProxiesEmpty onAdd={() => addProxy()} onImport={openImport} />;

  const run = snapshot.runtime.testRun;
  const filtering = isFiltering(filter);
  const groups = groupByProvider(snapshot.providers, proxies, filter);
  const shownCount = groups.reduce((total, group) => total + group.visible.length, 0);
  const allOpen = groups.every((group) => !closed.has(group.provider.id));
  const summary = filtering
    ? `${shownCount} of ${proxies.length} shown`
    : `${plural(proxies.length, 'proxy', 'proxies')} · ${plural(groups.length, 'provider', 'providers')}`;

  const toggleAll = () =>
    onClosedChange(allOpen ? new Set(groups.map((group) => group.provider.id)) : new Set());

  return (
    <>
      <TrustNote />
      <ProxyFilters
        filter={filter}
        onChange={(patch) => onFilterChange({ ...filter, ...patch })}
        summary={summary}
        allOpen={allOpen}
        onToggleAll={toggleAll}
      />
      {run ? (
        <TestRunBar done={run.done} total={run.total} onStop={() => void call('stopTesting')} />
      ) : null}
      {groups.map((group) =>
        filtering && !group.visible.length ? null : (
          <ProviderGroup
            key={group.provider.id}
            provider={group.provider}
            total={group.proxies.length}
            proxies={group.visible}
            open={!closed.has(group.provider.id)}
            onToggle={() => onClosedChange(toggled(closed, group.provider.id))}
          />
        )
      )}
      {filtering && shownCount === 0 ? (
        <NoMatches onClear={() => onFilterChange(NO_FILTER)} />
      ) : null}
    </>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <Card className="fp-card text-fp-muted px-5 py-10 text-center text-sm">
      <div>
        No proxies match these filters.{' '}
        <Button
          variant="link"
          className="text-fp-accent-ink h-auto p-0 font-semibold hover:no-underline"
          onClick={onClear}
        >
          Clear filters
        </Button>
      </div>
    </Card>
  );
}
