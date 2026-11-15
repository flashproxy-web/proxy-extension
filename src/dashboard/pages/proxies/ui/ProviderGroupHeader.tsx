import { ChevronDown, Pencil } from 'lucide-react';
import { useState } from 'react';

import { PROVIDER_DOMAIN_VW } from '@/dashboard/shared/config';
import { plural } from '@/dashboard/shared/lib/format';
import { useDashboard } from '@/dashboard/shared/model';
import { Tile } from '@/dashboard/shared/ui/Tile';
import { call } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import type { Provider } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { ProviderColorPicker } from './ProviderColorPicker';
import { ProviderNameInput } from './ProviderNameInput';

export function ProviderGroupHeader({
  provider,
  total,
  open,
  onToggle,
}: {
  provider: Provider;
  total: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { viewportWidth } = useDashboard();
  const [renaming, setRenaming] = useState(false);
  const toggleLabel = open ? 'Collapse' : 'Expand';

  return (
    <div className="flex flex-wrap items-center gap-2.5 py-3 pr-3.5 pl-3">
      <TooltipHint label={toggleLabel}>
        <Button
          variant="ghost"
          size="icon"
          className="size-6.5"
          aria-label={toggleLabel}
          aria-expanded={open}
          onClick={onToggle}
        >
          <ChevronDown
            className={cn('size-4 transition-transform duration-150', !open && '-rotate-90')}
          />
        </Button>
      </TooltipHint>
      <Tile color={provider.color} className="size-6.5 rounded-md">
        {provider.initial}
      </Tile>
      {renaming ? (
        <ProviderNameInput provider={provider} onDone={() => setRenaming(false)} />
      ) : (
        <Button
          variant="link"
          className="h-auto p-0 text-base font-semibold text-inherit hover:no-underline"
          onClick={onToggle}
        >
          {provider.name}
        </Button>
      )}
      <span className="text-fp-muted2 text-sm">{plural(total, 'proxy', 'proxies')}</span>
      {provider.domain && viewportWidth >= PROVIDER_DOMAIN_VW ? (
        <span className="text-fp-muted2 text-xs whitespace-nowrap">
          · auto-detected from <code>{provider.domain}</code>
        </span>
      ) : null}
      <span className="flex-1" />
      <ProviderColorPicker
        color={provider.color}
        onPick={(color) => void call('setProviderColor', provider.id, color)}
      />
      <TooltipHint label="Rename provider">
        <Button
          variant="ghost"
          size="icon"
          className="text-fp-muted size-7"
          aria-label="Rename provider"
          onClick={() => setRenaming(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
      </TooltipHint>
    </div>
  );
}
