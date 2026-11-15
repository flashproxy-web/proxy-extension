import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { MENU_ROW } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import type { OwnProxy, Provider } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { FlagTile } from '@/shared/ui/FlagTile';
import { StatusDot } from '@/shared/ui/StatusDot';

function healthLabel(proxy: OwnProxy): string {
  if (!proxy.healthy) return 'failing health check';
  return proxy.latency != null ? proxy.latency + ' ms' : 'not checked yet';
}

function ProxyMenuRow({ proxy }: { proxy: OwnProxy }) {
  const { model, setUi } = usePopup();
  const selected = model.isOwn && model.proxy?.id === proxy.id;
  const poolSize = proxy.endpoints.length;
  const pick = () => {
    setUi({ srcOpen: false });
    send({ type: 'pickOwn', proxyId: proxy.id });
  };
  return (
    <Button
      variant="ghost"
      className={cn(
        MENU_ROW,
        'prox py-1.5 pl-11.5 has-[>svg]:pl-11.5',
        selected && 'sel bg-fp-soft'
      )}
      onClick={pick}
    >
      <FlagTile cc={proxy.cc} size="xs" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{proxy.label}</span>
        <span className="text-fp-muted2 block truncate text-xs">
          {proxy.protocol} · {healthLabel(proxy)}
          {poolSize > 1 ? ' · pool of ' + poolSize : ''}
        </span>
      </span>
      <StatusDot tone={proxy.healthy ? 'ok' : 'bad'} />
      {selected ? <Check className="text-accent size-3.5!" /> : null}
    </Button>
  );
}

export function ProviderGroup({
  provider,
  proxies,
  open,
}: {
  provider: Provider;
  proxies: OwnProxy[];
  open: boolean;
}) {
  const { setUi } = usePopup();
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <div>
      <Button
        variant="ghost"
        className={MENU_ROW}
        aria-expanded={open}
        onClick={() => setUi({ openGroup: open ? '' : provider.id })}
      >
        <span
          className="flex size-7 flex-none items-center justify-center rounded-sm text-xs font-bold text-white"
          style={{ background: provider.color }}
        >
          {provider.initial}
        </span>
        <span className="flex-1 text-sm font-semibold">
          {provider.name} · {proxies.length}
        </span>
        <Chevron className="text-fp-muted2 size-3.25!" />
      </Button>
      {open ? proxies.map((proxy) => <ProxyMenuRow key={proxy.id} proxy={proxy} />) : null}
    </div>
  );
}
