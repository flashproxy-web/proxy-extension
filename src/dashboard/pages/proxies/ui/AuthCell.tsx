import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { call } from '@/shared/api/client';
import type { OwnProxy } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function AuthCell({ proxy }: { proxy: OwnProxy }) {
  const [revealed, setRevealed] = useState<string | null>(null);

  if (!proxy.hasAuth)
    return (
      <div className="flex min-w-0 items-center gap-1">
        <span className="text-fp-muted2 truncate font-mono text-xs">IP whitelist</span>
      </div>
    );

  const toggleLabel = revealed ? 'Hide credentials' : 'Show credentials';
  const toggle = async () => {
    if (revealed) return setRevealed(null);
    const credentials = await call('getCredentials', proxy.id);
    if (credentials) setRevealed(`${credentials.username}:${credentials.password}`);
  };

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="text-fp-ink truncate font-mono text-xs">
        {revealed ?? `${proxy.userHint ?? ''}… : ••••••`}
      </span>
      <TooltipHint label={toggleLabel}>
        <Button
          variant="ghost"
          size="icon"
          className="text-fp-muted2 size-6 shrink-0"
          aria-label={toggleLabel}
          onClick={() => void toggle()}
        >
          {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
      </TooltipHint>
    </div>
  );
}
