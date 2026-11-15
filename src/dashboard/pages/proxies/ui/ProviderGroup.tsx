import type { OwnProxy, Provider } from '@/shared/model';
import { Card } from '@/shared/ui/card';

import { ProviderGroupHeader } from './ProviderGroupHeader';
import { ProxyTable } from './ProxyTable';

export function ProviderGroup({
  provider,
  total,
  proxies,
  open,
  onToggle,
}: {
  provider: Provider;
  total: number;
  proxies: OwnProxy[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="fp-card mb-3 gap-0 overflow-hidden py-0">
      <ProviderGroupHeader provider={provider} total={total} open={open} onToggle={onToggle} />
      {open ? <ProxyTable provider={provider} proxies={proxies} /> : null}
    </Card>
  );
}
