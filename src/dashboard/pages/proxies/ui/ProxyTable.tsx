import { Plus } from 'lucide-react';
import { Fragment } from 'react';

import { PROXY_COLUMNS } from '@/dashboard/shared/config';
import { useDashboard } from '@/dashboard/shared/model';
import { cn } from '@/shared/lib/utils';
import type { OwnProxy, Provider } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

import { useProxiesPage } from '../model/proxies-page-context';

import { PoolDetails } from './PoolDetails';
import { ProxyRow } from './ProxyRow';

export function ProxyTable({ provider, proxies }: { provider: Provider; proxies: OwnProxy[] }) {
  const { snapshot } = useDashboard();
  const { openPools } = useProxiesPage();
  const testing = new Set(snapshot.runtime.testing);

  return (
    <Table className="min-w-4xl table-fixed">
      <TableHeader>
        <TableRow className="border-fp-line bg-fp-panel hover:bg-fp-panel border-t">
          {PROXY_COLUMNS.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                'text-fp-muted2 h-auto py-2 text-xs font-semibold tracking-wider uppercase',
                column.className
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {proxies.map((proxy) => (
          <Fragment key={proxy.id}>
            <ProxyRow proxy={proxy} testing={testing.has(proxy.id)} />
            {proxy.endpoints.length > 1 && openPools.has(proxy.id) ? (
              <PoolDetails proxy={proxy} colSpan={PROXY_COLUMNS.length} />
            ) : null}
          </Fragment>
        ))}
        <AddProxyRow provider={provider} />
      </TableBody>
    </Table>
  );
}

function AddProxyRow({ provider }: { provider: Provider }) {
  const { addProxy } = useProxiesPage();

  return (
    <TableRow className="border-fp-line hover:bg-transparent">
      <TableCell colSpan={PROXY_COLUMNS.length} className="p-0">
        <Button
          variant="link"
          size="icon"
          onClick={() => addProxy(provider.id)}
          className="text-fp-muted2 hover:bg-fp-panel hover:text-fp-accent-ink h-10 w-full justify-start gap-2 rounded-none pr-3.5 pl-12.5 text-sm font-medium transition-colors hover:no-underline"
        >
          <Plus className="size-3.5" />
          Add proxy to {provider.name}
        </Button>
      </TableCell>
    </TableRow>
  );
}
