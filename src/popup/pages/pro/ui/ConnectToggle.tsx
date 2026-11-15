import { Power } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { send } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

function trackClass(live: boolean, connecting: boolean): string {
  if (!live) return 'bg-fp-line2 shadow-inner hover:bg-fp-line2';
  return connecting ? 'bg-accent/60 hover:bg-accent/60' : 'bg-accent shadow-md hover:bg-accent';
}

export function ConnectToggle() {
  const { model } = usePopup();
  const { live, connecting } = model;
  return (
    <TooltipHint label={live ? 'Disconnect' : 'Connect'}>
      <Button
        variant="secondary"
        className={cn(
          'toggle relative h-10 w-17.5 flex-none rounded-full! p-0 transition-colors duration-300',
          trackClass(live, connecting)
        )}
        aria-label="Connect"
        aria-pressed={live}
        onClick={() => send({ type: 'toggle' })}
      >
        <span
          className={cn(
            'absolute top-1 flex size-8 items-center justify-center rounded-full bg-white ring-1 ring-black/10 drop-shadow-sm transition-[left] duration-300 ease-out',
            live ? 'left-8.5' : 'left-1'
          )}
        >
          {connecting ? (
            <span className="border-fp-soft-line border-t-accent size-3.5 animate-spin rounded-full border-2" />
          ) : (
            <Power className={cn('size-3.5!', live ? 'text-accent' : 'text-fp-muted2')} />
          )}
        </span>
      </Button>
    </TooltipHint>
  );
}
