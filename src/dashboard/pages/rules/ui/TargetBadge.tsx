import { ArrowUpRight, Ban } from 'lucide-react';

import { useDashboard } from '@/dashboard/shared/model';
import { Tile } from '@/dashboard/shared/ui/Tile';
import { cn } from '@/shared/lib/utils';
import type { RuleTarget } from '@/shared/model';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';

/** The 18px tile used for rule targets: FlashProxy star, provider initial, pool, Direct or Block. */
export function TargetBadge({
  target,
  className,
}: {
  target: RuleTarget | null;
  className?: string;
}) {
  const { lookup } = useDashboard();

  if (!target) return <Tile className={cn('bg-fp-panel', className)} />;

  switch (target.kind) {
    case 'fp':
      return (
        <Tile className={cn('bg-fp-soft', className)}>
          <FlashProxyStar size={12} />
        </Tile>
      );
    case 'block':
      return (
        <Tile className={cn('bg-fp-red/10', className)}>
          <Ban className="text-fp-red size-3" />
        </Tile>
      );
    case 'direct':
      return (
        <Tile className={cn('bg-fp-panel', className)}>
          <ArrowUpRight className="text-fp-muted size-3" />
        </Tile>
      );
    case 'own': {
      const proxy = lookup.proxies.get(target.proxyId);
      const provider = proxy ? lookup.providers.get(proxy.providerId) : undefined;
      return (
        <Tile color={provider?.color} className={cn('bg-fp-muted2', className)}>
          {(provider?.name ?? '?')[0].toUpperCase()}
        </Tile>
      );
    }
  }
}
