import { Pin, PinOff, Settings } from 'lucide-react';

import { PRODUCT_NAME } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { PulseRing } from './PulseRing';

export function ExtensionsMenu({
  pinned,
  onTogglePin,
}: {
  pinned: boolean;
  onTogglePin: () => void;
}) {
  const pinLabel = pinned ? 'Unpin' : 'Pin';

  return (
    <div className="animate-in border-fp-line bg-card fade-in slide-in-from-top-1 absolute top-16.5 right-14.5 z-10 w-67.5 rounded-md border p-2 shadow-lg duration-180 ease-out">
      <div className="text-fp-muted2 px-2 pt-1.5 pb-2 text-xs font-semibold">Extensions</div>
      <div className="bg-fp-panel flex h-10 items-center gap-2.5 rounded-lg px-2">
        <FlashProxyStar size={18} />
        <span className="flex-1 text-sm font-semibold">{PRODUCT_NAME}</span>
        <TooltipHint label={pinLabel}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={pinLabel}
            onClick={onTogglePin}
            className={cn(
              'relative size-7.5 rounded-sm',
              pinned ? 'bg-fp-soft text-accent' : 'text-fp-muted'
            )}
          >
            {pinned ? <PinOff size={15} /> : <Pin size={15} />}
            {pinned ? null : <PulseRing className="-inset-0.75 rounded-sm" />}
          </Button>
        </TooltipHint>
      </div>
      <div className="text-fp-muted2 flex h-9 items-center gap-2.5 px-2 text-sm">
        <Settings size={14} />
        Manage extensions
      </div>
    </div>
  );
}
