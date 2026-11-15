import { Lock, Puzzle } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { PREVIEW_URL, WINDOW_DOTS } from '../config';

import { PulseRing } from './PulseRing';

export function ToolbarMock({
  pinned,
  menuOpen,
  onToggleMenu,
}: {
  pinned: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <div className="border-fp-line bg-card flex h-11 items-center gap-2.5 rounded-sm border pr-2 pl-3">
      <span className="flex gap-1.5">
        {WINDOW_DOTS.map((dotClass) => (
          <span key={dotClass} className={cn('size-2.25 rounded-full', dotClass)} />
        ))}
      </span>
      <span className="bg-fp-panel text-fp-muted flex h-7 min-w-0 flex-1 items-center gap-2 rounded-full px-3 text-xs">
        <Lock size={11} className="flex-none" />
        <span className="truncate">{PREVIEW_URL}</span>
      </span>
      {pinned ? (
        <TooltipHint label="FlashProxy">
          <span className="animate-in bg-fp-soft fade-in zoom-in-50 flex size-7.5 flex-none items-center justify-center rounded-lg duration-350">
            <FlashProxyStar size={17} />
          </span>
        </TooltipHint>
      ) : null}
      <TooltipHint label="Extensions">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Extensions"
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
          className={cn(
            'text-fp-ink relative size-7.5 flex-none rounded-lg',
            menuOpen ? 'bg-fp-panel' : null
          )}
        >
          <Puzzle size={16} />
          {menuOpen || pinned ? null : <PulseRing className="-inset-1 rounded-md" />}
        </Button>
      </TooltipHint>
      <span className="from-fp-accent-ink to-accent size-6.5 flex-none rounded-full bg-linear-145" />
    </div>
  );
}
