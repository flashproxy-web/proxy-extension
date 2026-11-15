import { ExternalLink, LogOut, Users } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { BRAND_GRADIENT, OPENING_FP_WEB } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { TOAST_INFO } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import type { Account } from '@/shared/model';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const ITEM = 'h-9 gap-2.5 rounded-sm px-2.5 text-sm font-medium whitespace-nowrap';

function AccountSummary({ account }: { account: Account }) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 pt-2.5 pb-3">
      <Avatar className="size-9 flex-none">
        <AvatarFallback className={cn('text-sm font-bold text-white', BRAND_GRADIENT)}>
          {account.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{account.name}</div>
        <div className="text-fp-muted2 truncate text-xs">{account.email}</div>
      </div>
    </div>
  );
}

export function AccountMenu({
  account,
  side = 'bottom',
  className,
}: {
  account: Account;
  side?: 'top' | 'bottom';
  className?: string;
}) {
  const { ui, setUi, toast } = usePopup();
  const setOpen = (open: boolean) => setUi({ acctOpen: open, srcOpen: false });
  const manageAccount = () => {
    toast({ text: OPENING_FP_WEB, icon: 'external-link', color: TOAST_INFO });
    send({ type: 'open', target: { kind: 'web', page: 'account' } });
  };
  return (
    <DropdownMenu open={ui.acctOpen} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          title={account.email}
          className={cn(
            'data-[state=open]:ring-accent/30 size-7 rounded-full! text-xs font-bold! text-white data-[state=open]:ring-3',
            BRAND_GRADIENT,
            className
          )}
        >
          {account.initials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align="end"
        sideOffset={6}
        className="min-w-67.5 p-1.5 shadow-lg"
      >
        <AccountSummary account={account} />
        <DropdownMenuSeparator className="mx-1 mt-0 mb-1" />
        <DropdownMenuItem className={ITEM} onSelect={manageAccount}>
          <ExternalLink className="size-4" />
          Manage account on flashproxy.com
        </DropdownMenuItem>
        <DropdownMenuItem className={ITEM} onSelect={() => send({ type: 'switchAccount' })}>
          <Users className="size-4" />
          Use a different API key
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className={ITEM}
          onSelect={() => send({ type: 'signOut' })}
        >
          <LogOut className="size-4" />
          Remove API key
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
