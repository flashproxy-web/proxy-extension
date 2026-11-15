import { LayoutDashboard, Settings } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { OPENING_SETTINGS } from '@/popup/shared/config';
import { AccountMenu } from '@/popup/widgets/header';
import { send } from '@/shared/api/client';
import { DASH_ROUTE } from '@/shared/config';
import { Button } from '@/shared/ui/button';

const LINK =
  's-fbtn h-8.5 gap-1.75 px-2.5 text-[13px] font-semibold! text-fp-muted hover:bg-fp-panel hover:text-foreground';

function SignInButton() {
  return (
    <Button
      variant="outline"
      className="s-signin hover:border-accent hover:bg-card hover:text-foreground h-8 px-3 text-[13px] font-semibold! shadow-none"
      onClick={() => send({ type: 'signIn', connect: false })}
    >
      Add API key
    </Button>
  );
}

export function SimpleFooter() {
  const { snapshot, openDash } = usePopup();
  const { account } = snapshot;
  return (
    <div className="border-fp-line bg-card flex h-13 flex-none items-center gap-1 border-t px-2.5">
      <Button variant="ghost" className={LINK} onClick={() => openDash()}>
        <LayoutDashboard className="size-3.75" />
        Dashboard
      </Button>
      <Button
        variant="ghost"
        className={LINK}
        onClick={() => openDash(DASH_ROUTE.settings, OPENING_SETTINGS)}
      >
        <Settings className="size-3.75" />
        Settings
      </Button>
      <span className="flex-1" />
      {account ? (
        <AccountMenu account={account} side="top" className="size-7.5" />
      ) : (
        <SignInButton />
      )}
    </div>
  );
}
