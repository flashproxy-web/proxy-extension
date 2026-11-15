import { Power } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { BRAND_GRADIENT } from '@/popup/shared/config';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { powerAction, powerLook, type PowerLook, type SimpleProblem } from '../model/simple';

/** Power button looks: off, connecting, connected, and a problem in red or amber. */
const POWER: Record<PowerLook, { halo: string; button: string }> = {
  off: {
    halo: 'bg-transparent',
    button:
      'border-fp-line2 bg-card text-fp-muted2 shadow-lg hover:bg-card hover:text-fp-muted2 dark:hover:bg-card',
  },
  connecting: {
    halo: 'bg-transparent',
    button:
      'border-fp-soft-line bg-fp-soft text-accent hover:bg-fp-soft hover:text-accent dark:hover:bg-fp-soft',
  },
  on: {
    halo: 'bg-accent/12',
    button: cn(
      'border-transparent text-white shadow-[0_18px_40px_-14px] shadow-accent/75 hover:text-white',
      BRAND_GRADIENT
    ),
  },
  red: {
    halo: 'bg-fp-red/7',
    button:
      'border-fp-red bg-card text-fp-red shadow-lg hover:bg-card hover:text-fp-red dark:hover:bg-card',
  },
  amber: {
    halo: 'bg-fp-amber/8',
    button:
      'border-fp-amber bg-card text-fp-amber shadow-lg hover:bg-card hover:text-fp-amber dark:hover:bg-card',
  },
};

export function PowerButton({ problem }: { problem: SimpleProblem | undefined }) {
  const { model } = usePopup();
  const look = POWER[powerLook(model, problem)];
  const action = powerAction(model, problem);
  return (
    <div
      className={cn(
        'flex size-37 flex-none items-center justify-center rounded-full transition-colors duration-300',
        look.halo
      )}
    >
      <TooltipHint label={action.hint}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={action.hint}
          onClick={action.run}
          className={cn(
            's-power relative flex size-30 cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-all duration-300 active:scale-97',
            look.button
          )}
        >
          {model.connecting ? (
            <span className="border-t-accent border-r-accent absolute -inset-1.5 animate-spin rounded-full border-3 border-transparent" />
          ) : null}
          <Power className="size-10" />
        </Button>
      </TooltipHint>
    </div>
  );
}
