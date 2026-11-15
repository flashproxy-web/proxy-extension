import { ChevronsUpDown } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { Button } from '@/shared/ui/button';
import { StatusDot } from '@/shared/ui/StatusDot';

import { profileStatus } from '../model/connection';

function ProfileButton() {
  const { model, openSheet } = usePopup();
  const profile = profileStatus(model);
  return (
    <Button
      variant="outline"
      className="h-8.5 min-w-0 flex-1 shrink justify-start gap-2 px-2.5"
      onClick={() => openSheet(model.isOwn ? 'own' : 'prof')}
    >
      <StatusDot tone={profile.tone} />
      <span className="min-w-0 flex-1 truncate text-left text-xs font-semibold">
        {profile.name}
      </span>
      <span className="font-mono text-xs font-normal" style={{ color: profile.color }}>
        {profile.latency}
      </span>
      <ChevronsUpDown className="text-fp-muted2 size-3!" />
    </Button>
  );
}

function CommandsButton() {
  const { openSheet } = usePopup();
  return (
    <Button
      variant="outline"
      className="text-fp-muted! h-8.5 flex-none gap-1.75 px-2.5 text-xs"
      title="Command bar"
      onClick={() => openSheet('cmd')}
    >
      <kbd className="border-fp-line2 bg-fp-panel text-foreground flex h-4.5 min-w-4.5 items-center justify-center rounded border px-1 text-xs font-semibold">
        /
      </kbd>
      Commands
    </Button>
  );
}

export function PopupFooter() {
  return (
    <div className="border-fp-line bg-card flex h-12.5 flex-none items-center gap-2 border-t px-2.5">
      <ProfileButton />
      <CommandsButton />
    </div>
  );
}
