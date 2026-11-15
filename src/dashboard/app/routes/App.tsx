import { useRef } from 'react';

import { ProxiesPage } from '@/dashboard/pages/proxies';
import { RulesPage } from '@/dashboard/pages/rules';
import { SettingsPage } from '@/dashboard/pages/settings';
import { LOADING_LABEL, NARROW_VW } from '@/dashboard/shared/config';
import { createSnapshotLookup } from '@/dashboard/shared/lib/snapshot-lookup';
import { DashboardContext, type Page } from '@/dashboard/shared/model';
import { ErrorCard } from '@/dashboard/shared/ui/ErrorCard';
import { LoadingState } from '@/dashboard/shared/ui/LoadingState';
import { Sidebar } from '@/dashboard/widgets/sidebar';
import { TopBar } from '@/dashboard/widgets/top-bar';
import { useThemeClass } from '@/shared/lib/use-theme-class';
import { ConfirmDialogHost } from '@/shared/ui/confirm-dialog';
import { Toaster } from '@/shared/ui/sonner';
import { TooltipProvider } from '@/shared/ui/tooltip';

import { usePageQuery } from '../lib/use-page-query';
import { useSnapshot } from '../lib/use-snapshot';
import { useViewportWidth } from '../lib/use-viewport-width';

function PageView({ page }: { page: Page }) {
  switch (page) {
    case 'proxies':
      return <ProxiesPage />;
    case 'rules':
      return <RulesPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

export function Dashboard() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTop = () => scrollRef.current?.scrollTo(0, 0);
  const { snapshot, failed, retry } = useSnapshot();
  const { query, page, go } = usePageQuery(scrollTop);
  const viewportWidth = useViewportWidth();
  const dark = useThemeClass(snapshot?.settings.theme);

  const narrow = viewportWidth < NARROW_VW;
  const counts = snapshot
    ? { proxies: snapshot.ownProxies.length, rules: snapshot.rules.length }
    : {};
  const dashboard = snapshot
    ? { snapshot, lookup: createSnapshotLookup(snapshot), go, query, viewportWidth }
    : null;

  return (
    <TooltipProvider>
      <div className="bg-muted text-fp-ink flex h-screen min-h-0 overflow-hidden">
        <Sidebar page={page} narrow={narrow} counts={counts} go={go} />
        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar page={page} snapshot={snapshot} viewportWidth={viewportWidth} />
          <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div
              key={page}
              className="fp-page-in mx-auto w-full max-w-310 px-4 pt-5 pb-16 md:px-9 md:pt-7.5 md:pb-18"
            >
              {dashboard ? (
                <DashboardContext value={dashboard}>
                  <PageView page={page} />
                </DashboardContext>
              ) : failed ? (
                <ErrorCard retry={retry} />
              ) : (
                <LoadingState label={LOADING_LABEL[page]} />
              )}
            </div>
          </div>
        </main>
        <Toaster theme={dark ? 'dark' : 'light'} />
        <ConfirmDialogHost />
      </div>
    </TooltipProvider>
  );
}
