import { STRATEGIES, STRATEGY_TEXT } from '@/dashboard/shared/config';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { call } from '@/shared/api/client';
import type { OwnProxy } from '@/shared/model';
import { TableCell, TableRow } from '@/shared/ui/table';

import { EndpointChip } from './EndpointChip';

export function PoolDetails({ proxy, colSpan }: { proxy: OwnProxy; colSpan: number }) {
  const { endpoints } = proxy;
  const healthy = endpoints.filter((endpoint) => endpoint.healthy !== false).length;

  return (
    <TableRow className="border-fp-line bg-fp-panel hover:bg-fp-panel border-t border-dashed">
      <TableCell colSpan={colSpan} className="pt-2.5 pr-3.5 pb-3.5 pl-12.5 whitespace-normal">
        <div className="mb-1.5 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">{endpoints.length} endpoints</span>
          <span className="text-fp-muted2 text-xs">
            {healthy} of {endpoints.length} healthy
          </span>
          <span className="flex-1" />
          <SegmentedControl
            options={STRATEGIES}
            value={proxy.strategy}
            onValueChange={(strategy) => void call('setStrategy', proxy.id, strategy)}
          />
        </div>
        <div className="text-fp-muted2 mb-2.5 text-xs">{STRATEGY_TEXT[proxy.strategy]}</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-1.5">
          {endpoints.map((endpoint) => (
            <EndpointChip key={endpoint.host + ':' + endpoint.port} endpoint={endpoint} />
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
