import { RefreshCw } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { send } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export function NewIpButton() {
  const { model } = usePopup();
  const { on, rotating } = model;
  const rotate = () => {
    if (on) send({ type: 'rotate' });
  };
  return (
    <Button
      variant="outline"
      title="Get a new exit IP"
      onClick={rotate}
      className={cn(
        's-newip border-fp-line2 bg-card hover:bg-card h-10 w-full flex-none gap-2 rounded-[10px] text-sm font-semibold! shadow-none',
        on
          ? 'text-foreground hover:border-accent hover:text-foreground'
          : 'text-fp-muted2 hover:text-fp-muted2 cursor-default',
        rotating && 'text-foreground'
      )}
    >
      <RefreshCw className={cn('size-3.75', rotating && 'animate-spin')} />
      {rotating ? 'Getting a new IP…' : 'New IP'}
    </Button>
  );
}
