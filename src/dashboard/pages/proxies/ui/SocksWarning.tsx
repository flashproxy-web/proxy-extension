import { TriangleAlert } from 'lucide-react';

import type { Protocol } from '@/shared/model';
import { Button } from '@/shared/ui/button';

export function SocksWarning({ protocol, onRemove }: { protocol: Protocol; onRemove: () => void }) {
  return (
    <div className="border-fp-amber/30 bg-fp-amber/10 flex gap-2.5 rounded-lg border px-3.5 py-3">
      <TriangleAlert className="text-fp-amber mt-px size-4 shrink-0" />
      <div className="flex-1 text-sm leading-normal">
        <div className="font-semibold">
          {protocol === 'SOCKS5'
            ? 'Chrome can’t log in to SOCKS5 proxies. Use IP whitelisting instead.'
            : 'SOCKS4 has no password support. Use IP whitelisting instead.'}
        </div>
        <div className="text-fp-muted mt-0.5">
          Remove the username and password, then whitelist this computer's IP in your provider's
          dashboard.
        </div>
        <Button
          type="button"
          variant="link"
          onClick={onRemove}
          className="text-fp-amber mt-2 h-auto p-0 text-sm font-semibold hover:no-underline"
        >
          Remove credentials
        </Button>
      </div>
    </div>
  );
}
