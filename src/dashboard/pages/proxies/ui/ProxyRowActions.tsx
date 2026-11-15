import { Activity, Copy, Ellipsis, LoaderCircle, Pencil, Trash2 } from 'lucide-react';

import { useDashboard } from '@/dashboard/shared/model';
import { Tile } from '@/dashboard/shared/ui/Tile';
import type { OwnProxy } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { useProxiesPage } from '../model/proxies-page-context';
import { deleteProxy, duplicateProxy, moveProxy, testProxy } from '../model/proxy-actions';

export function ProxyRowActions({ proxy, testing }: { proxy: OwnProxy; testing: boolean }) {
  const { snapshot } = useDashboard();
  const { editProxy } = useProxiesPage();
  const otherProviders = snapshot.providers.filter((provider) => provider.id !== proxy.providerId);

  return (
    <div className="flex justify-end gap-0.5">
      <TooltipHint label="Test">
        <Button
          variant="ghost"
          size="icon"
          className="text-fp-muted hover:text-accent! size-7.5"
          aria-label="Test"
          onClick={() => void testProxy(proxy)}
          disabled={testing}
        >
          {testing ? <LoaderCircle className="animate-spin" /> : <Activity />}
        </Button>
      </TooltipHint>
      <DropdownMenu modal={false}>
        <TooltipHint label="More actions">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-fp-muted size-7.5"
              aria-label="More actions"
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
        </TooltipHint>
        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <DropdownMenuItem onSelect={() => editProxy(proxy.id)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void duplicateProxy(proxy)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void testProxy(proxy)}>
            <Activity />
            Test now
          </DropdownMenuItem>
          {otherProviders.length > 0 ? (
            <DropdownMenuLabel className="text-fp-muted2 px-2 pt-2 pb-1 text-xs font-semibold tracking-wider uppercase">
              Move to
            </DropdownMenuLabel>
          ) : null}
          {otherProviders.map((provider) => (
            <DropdownMenuItem key={provider.id} onSelect={() => void moveProxy(proxy, provider)}>
              <Tile color={provider.color} className="size-4 rounded-sm">
                {provider.initial}
              </Tile>
              {provider.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => void deleteProxy(proxy)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
