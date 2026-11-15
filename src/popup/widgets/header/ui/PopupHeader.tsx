import { LayoutDashboard } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { Button } from '@/shared/ui/button';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';
import { Popover, PopoverTrigger } from '@/shared/ui/popover';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { AccountMenu } from './AccountMenu';
import { LayoutSwitch } from './LayoutSwitch';
import { SourceChip } from './SourceChip';
import { SourceMenu } from './SourceMenu';

function SourcePicker() {
  const { ui, setUi } = usePopup();
  const setOpen = (open: boolean) =>
    setUi(open ? { srcOpen: true, sheet: null } : { srcOpen: false });
  return (
    <Popover open={ui.srcOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SourceChip />
      </PopoverTrigger>
      <SourceMenu />
    </Popover>
  );
}

function DashboardButton() {
  const { openDash } = usePopup();
  return (
    <TooltipHint label="Open dashboard">
      <Button
        variant="ghost"
        size="icon"
        className="text-fp-muted2 size-7.5"
        aria-label="Open dashboard"
        onClick={() => openDash()}
      >
        <LayoutDashboard className="size-4" />
      </Button>
    </TooltipHint>
  );
}

export function PopupHeader() {
  const { snapshot, model } = usePopup();
  // Simple keeps the wordmark; Pro needs the room for the source chip.
  const simple = snapshot.settings.ui === 'simple';
  const account = snapshot.account;
  const showSource = !simple && model.hasAny && !snapshot.runtime.signin;
  return (
    <div className="border-fp-line bg-card flex h-13 flex-none items-center gap-2 border-b pr-3 pl-3.5">
      <FlashProxyStar size={20} />
      {simple ? (
        <span className="flex-none text-base font-bold tracking-tight">FlashProxy</span>
      ) : null}
      <LayoutSwitch />
      <span className="min-w-0 flex-1" />
      {showSource ? <SourcePicker /> : null}
      {!simple && account ? (
        <>
          <DashboardButton />
          <AccountMenu account={account} />
        </>
      ) : null}
    </div>
  );
}
