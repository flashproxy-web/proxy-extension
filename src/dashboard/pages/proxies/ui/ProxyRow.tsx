import { ago } from '@/dashboard/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import type { OwnProxy } from '@/shared/model';
import { Badge } from '@/shared/ui/badge';
import { FlagTile } from '@/shared/ui/FlagTile';
import { TableCell, TableRow } from '@/shared/ui/table';

import { useProxiesPage } from '../model/proxies-page-context';

import { AuthCell } from './AuthCell';
import { HealthCell } from './HealthCell';
import { PoolChip } from './PoolChip';
import { ProxyRowActions } from './ProxyRowActions';

const rowClass = (proxy: OwnProxy, testing: boolean) =>
  testing ? 'bg-fp-soft' : proxy.healthy ? '' : 'bg-fp-red/5';

export function ProxyRow({ proxy, testing }: { proxy: OwnProxy; testing: boolean }) {
  const { openPools, togglePool } = useProxiesPage();
  const [firstEndpoint] = proxy.endpoints;

  return (
    <TableRow className={cn('border-fp-line hover:bg-fp-panel!', rowClass(proxy, testing))}>
      <TableCell className="py-2.5 pl-12.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="max-w-full truncate text-sm font-semibold">{proxy.label}</span>
          {proxy.endpoints.length > 1 ? (
            <PoolChip
              count={proxy.endpoints.length}
              open={openPools.has(proxy.id)}
              onClick={() => togglePool(proxy.id)}
            />
          ) : null}
        </div>
        {proxy.tags.length > 0 ? <ProxyTags tags={proxy.tags} /> : null}
      </TableCell>
      <TableCell>
        <code className="block truncate text-xs">
          {firstEndpoint.host}:{firstEndpoint.port}
        </code>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="border-fp-line bg-fp-panel text-fp-muted h-5.5 font-mono font-semibold"
        >
          {proxy.protocol}
        </Badge>
      </TableCell>
      <TableCell>
        <AuthCell proxy={proxy} />
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2 text-sm">
          {proxy.cc ? <FlagTile cc={proxy.cc} size="xs" /> : null}
          {proxy.cc ? proxy.cc.toUpperCase() : '—'}
        </span>
      </TableCell>
      <TableCell>
        <HealthCell proxy={proxy} testing={testing} />
      </TableCell>
      <TableCell className="text-fp-muted2 text-xs">
        {testing ? 'Now' : ago(proxy.checkedAt)}
      </TableCell>
      <TableCell className="pr-3.5">
        <ProxyRowActions proxy={proxy} testing={testing} />
      </TableCell>
    </TableRow>
  );
}

function ProxyTags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="border-fp-line bg-fp-panel text-fp-muted h-5 rounded-sm px-1.5 font-normal"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
