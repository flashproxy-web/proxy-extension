import { ChevronRight } from 'lucide-react';

import { CONN_PILL_VW, PAGE_BY_ID } from '@/dashboard/shared/config';
import { connection } from '@/dashboard/shared/lib/connection';
import type { Page } from '@/dashboard/shared/model';
import type { Snapshot } from '@/shared/model';

import { AccountAvatar } from './AccountAvatar';
import { ConnectionPill } from './ConnectionPill';
import { ThemeButton } from './ThemeButton';

export function TopBar({
  page,
  snapshot,
  viewportWidth,
}: {
  page: Page;
  snapshot: Snapshot | null;
  viewportWidth: number;
}) {
  return (
    <header className="border-fp-line relative z-30 flex h-17 shrink-0 items-center justify-between gap-4 border-b bg-[var(--fp-header)] px-4 pe-6 backdrop-blur-md">
      <div className="text-fp-muted2 flex min-w-0 items-center gap-2 text-sm whitespace-nowrap">
        <span>Switcher</span>
        <ChevronRight className="text-fp-line2 size-3.5" />
        <span className="text-fp-ink truncate font-semibold">{PAGE_BY_ID.get(page)?.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {snapshot && viewportWidth >= CONN_PILL_VW ? (
          <ConnectionPill connection={connection(snapshot)} />
        ) : null}
        <ThemeButton theme={snapshot?.settings.theme ?? 'system'} disabled={!snapshot} />
        {snapshot?.account ? <AccountAvatar account={snapshot.account} /> : null}
      </div>
    </header>
  );
}
