import { useState } from 'react';

import { toggled } from '@/dashboard/shared/lib/sets';
import { useDashboard } from '@/dashboard/shared/model';
import { PageHeader } from '@/dashboard/shared/ui/PageHeader';

import { clearDeepLink } from '../model/deep-link';
import { ProxiesPageContext, type ProxiesPageActions } from '../model/proxies-page-context';
import { NO_FILTER, type ProxyFilterState } from '../model/proxy-filter';

import { BuyPlanButton } from './BuyPlanButton';
import { ImportModal } from './ImportModal';
import { OwnProxiesActions } from './OwnProxiesActions';
import { OwnProxiesTab } from './OwnProxiesTab';
import { PlansTab } from './PlansTab';
import { ProxyDrawer, type DrawerSpec } from './ProxyDrawer';
import { ProxyTabs, type ProxyTab } from './ProxyTabs';

export function ProxiesPage() {
  const { snapshot, query } = useDashboard();
  const [tab, setTab] = useState<ProxyTab>(query.get('tab') === 'fp' ? 'fp' : 'own');
  const [drawer, setDrawer] = useState<DrawerSpec | null>(
    query.get('add') === '1' ? { mode: 'add', providerId: null } : null
  );
  const [importOpen, setImportOpen] = useState(query.get('import') === '1');
  const [filter, setFilter] = useState<ProxyFilterState>(NO_FILTER);
  const [closedGroups, setClosedGroups] = useState<ReadonlySet<string>>(() => new Set());
  const [openPools, setOpenPools] = useState<ReadonlySet<string>>(() => new Set());

  const actions: ProxiesPageActions = {
    openPools,
    togglePool: (proxyId) => setOpenPools((current) => toggled(current, proxyId)),
    editProxy: (proxyId) => setDrawer({ mode: 'edit', id: proxyId }),
    addProxy: (providerId = null) => setDrawer({ mode: 'add', providerId }),
    openImport: () => setImportOpen(true),
  };

  const closeDrawer = () => {
    setDrawer(null);
    clearDeepLink();
  };
  const closeImport = () => {
    setImportOpen(false);
    clearDeepLink();
  };
  const showSaved = (proxyId: string, pool: boolean) => {
    setTab('own');
    if (pool) setOpenPools((current) => toggled(current, proxyId, true));
  };

  return (
    <ProxiesPageContext value={actions}>
      <div data-screen-label="Proxies">
        <PageHeader title="Proxies" sub="Your FlashProxy plans and your own proxies, side by side.">
          {tab === 'own' ? <OwnProxiesActions /> : <BuyPlanButton />}
        </PageHeader>

        <ProxyTabs
          tab={tab}
          onChange={setTab}
          counts={{ fp: snapshot.plans.length, own: snapshot.ownProxies.length }}
        />

        {tab === 'fp' ? (
          <PlansTab onUseOwn={() => setTab('own')} />
        ) : (
          <OwnProxiesTab
            filter={filter}
            onFilterChange={setFilter}
            closed={closedGroups}
            onClosedChange={setClosedGroups}
          />
        )}

        {drawer ? <ProxyDrawer drawer={drawer} onClose={closeDrawer} onSaved={showSaved} /> : null}
        {importOpen ? <ImportModal onClose={closeImport} onDone={() => setTab('own')} /> : null}
      </div>
    </ProxiesPageContext>
  );
}
