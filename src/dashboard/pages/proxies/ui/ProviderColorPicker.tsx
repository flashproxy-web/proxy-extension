import { useState } from 'react';

import { SWATCHES } from '@/shared/lib/ownProxies';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function ProviderColorPicker({
  color,
  onPick,
}: {
  color: string;
  onPick: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const pick = (swatch: string) => {
    setOpen(false);
    onPick(swatch);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipHint label="Colour">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Colour">
            <span
              className="ring-fp-line2 ring-offset-card size-3.5 rounded-full ring-2 ring-offset-2"
              style={{ background: color }}
            />
          </Button>
        </PopoverTrigger>
      </TooltipHint>
      <PopoverContent align="end" className="grid w-auto grid-cols-4 gap-2 p-2.5">
        {SWATCHES.map((swatch) => (
          <TooltipHint key={swatch} label={swatch}>
            <Button
              variant="link"
              size="icon"
              aria-label={swatch}
              aria-pressed={swatch === color}
              className={cn(
                'ring-offset-card size-6 rounded-full ring-offset-2',
                swatch === color && 'ring-2 ring-current'
              )}
              style={{ background: swatch, color: swatch }}
              onClick={() => pick(swatch)}
            />
          </TooltipHint>
        ))}
      </PopoverContent>
    </Popover>
  );
}
