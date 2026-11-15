import type { Account } from '@/shared/model';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function AccountAvatar({ account }: { account: Account }) {
  return (
    <TooltipHint label={account.email}>
      <Avatar className="size-8.5">
        <AvatarFallback className="from-fp-accent-ink to-fp-accent-hover bg-linear-to-br text-xs font-bold text-white">
          {account.initials}
        </AvatarFallback>
      </Avatar>
    </TooltipHint>
  );
}
