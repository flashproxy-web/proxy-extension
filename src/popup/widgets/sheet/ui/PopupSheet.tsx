import { ChevronLeft, XIcon } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { Button } from '@/shared/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { sheetTitle } from '../model/sheet-title';

import { SheetBody } from './SheetBody';

function BackButton() {
  const { setUi } = usePopup();
  return (
    <TooltipHint label="Back">
      <Button
        variant="ghost"
        size="icon"
        className="text-fp-muted -ml-1.5 size-6.5"
        aria-label="Back"
        onClick={() => setUi({ drill: null, query: '' })}
      >
        <ChevronLeft className="size-4!" />
      </Button>
    </TooltipHint>
  );
}

function CloseButton() {
  const { closeSheet } = usePopup();
  return (
    <TooltipHint label="Close">
      <Button
        variant="secondary"
        size="icon"
        className="bg-fp-panel text-fp-muted size-6.5"
        aria-label="Close"
        onClick={closeSheet}
      >
        <XIcon className="size-3.25!" />
      </Button>
    </TooltipHint>
  );
}

export function PopupSheet() {
  const { model, ui, closeSheet } = usePopup();
  const drilled = ui.sheet === 'loc' && !!ui.drill;
  return (
    <Sheet open onOpenChange={(open) => (open ? undefined : closeSheet())}>
      <SheetContent
        side="bottom"
        showClose={false}
        aria-describedby={undefined}
        className="bg-muted max-h-[88%] gap-0 rounded-t-xl border-t-0 p-0 shadow-lg"
      >
        <div className="flex flex-none items-center gap-2 pt-3 pr-3 pb-2.5 pl-4">
          {drilled ? <BackButton /> : null}
          <SheetTitle className="flex-1 text-base font-bold tracking-tight">
            {sheetTitle(model, ui)}
          </SheetTitle>
          <span className="text-fp-muted2 text-xs">Esc</span>
          <CloseButton />
        </div>
        <SheetBody />
      </SheetContent>
    </Sheet>
  );
}
