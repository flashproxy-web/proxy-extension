import { Plus, XIcon } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { SECTION } from '@/popup/shared/config';
import { SheetCommand } from '@/popup/shared/ui/SheetCommand';
import { SheetRow } from '@/popup/shared/ui/SheetRow';
import { send } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { connectViaSections, type ViaSection } from '../model/connect-via';

function ViaSectionList({ section }: { section: ViaSection }) {
  return (
    <div>
      <div className={SECTION}>{section.head}</div>
      {section.rows.map((row) => (
        <SheetRow key={row.key} row={row} />
      ))}
    </div>
  );
}

function AddProxyButton() {
  const { closeVia, openAddProxy } = usePopup();
  const addProxy = () => {
    closeVia();
    openAddProxy();
  };
  return (
    <Button
      variant="ghost"
      className="via-add text-fp-accent-ink hover:bg-fp-panel hover:text-fp-accent-ink h-auto w-full justify-start gap-2.5 p-2 text-left text-sm font-semibold!"
      onClick={addProxy}
    >
      <span className="border-fp-line2 flex size-7 flex-none items-center justify-center rounded-md border-[1.5px] border-dashed">
        <Plus className="text-accent size-3.5!" />
      </span>
      Add a proxy
    </Button>
  );
}

function SignInPrompt() {
  const { closeVia } = usePopup();
  const signIn = () => {
    closeVia();
    send({ type: 'signIn', connect: false });
  };
  return (
    <>
      <Separator className="bg-fp-line mt-1.5" />
      <div className="text-fp-muted2 px-2 pt-2.5 pb-1 text-[12.5px]">
        Want FlashProxy locations?{' '}
        <Button
          variant="link"
          className="text-fp-accent-ink h-auto cursor-pointer p-0 text-[12.5px] font-semibold hover:no-underline"
          onClick={signIn}
        >
          Add API key
        </Button>
      </div>
    </>
  );
}

function CloseButton() {
  const { closeVia } = usePopup();
  return (
    <TooltipHint label="Close">
      <Button
        variant="secondary"
        size="icon"
        className="bg-fp-panel text-fp-muted size-6.5"
        aria-label="Close"
        onClick={closeVia}
      >
        <XIcon className="size-3.25!" />
      </Button>
    </TooltipHint>
  );
}

export function ConnectViaSheet() {
  const { model, ui, setQuery, closeVia } = usePopup();
  const query = ui.query.trim().toLowerCase();
  const sections = connectViaSections(model, query, closeVia);
  const empty = !!query && sections.every((section) => section.rows.length === 0);

  return (
    <Sheet open onOpenChange={(open) => (open ? undefined : closeVia())}>
      <SheetContent
        side="bottom"
        showClose={false}
        aria-describedby={undefined}
        className="bg-muted max-h-[88%] gap-0 rounded-t-xl border-t-0 p-0 shadow-lg"
      >
        <div className="flex flex-none items-center gap-2 pt-3 pr-3 pb-2.5 pl-4">
          <SheetTitle className="flex-1 text-base font-bold tracking-tight">Connect via</SheetTitle>
          <CloseButton />
        </div>
        <SheetCommand
          query={ui.query}
          onQuery={setQuery}
          placeholder={model.signedIn ? 'Search locations and your proxies' : 'Search your proxies'}
          empty={empty}
        >
          {sections.map((section) => (
            <ViaSectionList key={section.head} section={section} />
          ))}
          {query ? null : <AddProxyButton />}
          {query || model.signedIn ? null : <SignInPrompt />}
        </SheetCommand>
      </SheetContent>
    </Sheet>
  );
}
