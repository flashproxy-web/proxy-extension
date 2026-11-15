import { cn } from '@/shared/lib/utils';
import type { Endpoint } from '@/shared/model';
import { FlagTile } from '@/shared/ui/FlagTile';
import { StatusDot } from '@/shared/ui/StatusDot';

import { endpointLatency } from '../model/proxy-health';

export function EndpointChip({ endpoint }: { endpoint: Endpoint }) {
  const latency = endpointLatency(endpoint);

  return (
    <div className="border-fp-line bg-card flex h-8.5 items-center gap-2 rounded-lg border px-2.5">
      <FlagTile cc={endpoint.cc ?? null} size="xs" />
      <code className="min-w-0 flex-1 truncate text-xs">
        {endpoint.host}:{endpoint.port}
      </code>
      <StatusDot tone={endpoint.healthy === false ? 'bad' : 'ok'} className="size-1.5" />
      <span className={cn('w-13 text-right text-xs font-semibold tabular-nums', latency.className)}>
        {latency.text}
      </span>
    </div>
  );
}
