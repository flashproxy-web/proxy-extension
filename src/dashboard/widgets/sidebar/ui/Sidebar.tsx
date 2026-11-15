import { EXTERNAL_PAGES, PAGES } from '@/dashboard/shared/config';
import type { Page } from '@/dashboard/shared/model';
import { VERSION } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';

import { NavItem } from './NavItem';
import { NavLink } from './NavLink';

export function Sidebar({
  page,
  narrow,
  counts,
  go,
}: {
  page: Page;
  narrow: boolean;
  counts: Partial<Record<Page, number>>;
  go: (page: Page) => void;
}) {
  return (
    <aside
      className={cn(
        'border-fp-line flex shrink-0 flex-col overflow-hidden border-r bg-[var(--fp-side)] transition-[width] duration-200 ease-out',
        narrow ? 'w-17' : 'w-64'
      )}
    >
      <div
        className={cn(
          'border-fp-line flex h-16 shrink-0 items-center border-b',
          narrow ? 'justify-center' : 'gap-2.5 px-5'
        )}
      >
        <FlashProxyStar size={26} className="shrink-0" />
        {narrow ? null : (
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">FlashProxy</span>
            <span className="text-fp-muted2 text-xs">Proxy Manager</span>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-0.5 px-3 py-4">
        {narrow ? null : (
          <div className="text-fp-muted2 px-2.5 pb-1.5 text-xs font-semibold tracking-widest whitespace-nowrap uppercase">
            Proxy Manager
          </div>
        )}
        {PAGES.map((entry) => (
          <NavItem
            key={entry.page}
            icon={entry.icon}
            label={entry.label}
            count={counts[entry.page]}
            active={page === entry.page}
            narrow={narrow}
            onClick={() => go(entry.page)}
          />
        ))}
        {EXTERNAL_PAGES.map((entry) => (
          <NavLink
            key={entry.href}
            icon={entry.icon}
            label={entry.label}
            href={entry.href}
            narrow={narrow}
          />
        ))}
      </nav>
      <div className="flex-1" />
      {narrow ? null : (
        <div className="border-fp-line text-fp-muted2 shrink-0 border-t px-5 py-3 font-mono text-xs">
          v{VERSION} · Chrome
        </div>
      )}
    </aside>
  );
}
