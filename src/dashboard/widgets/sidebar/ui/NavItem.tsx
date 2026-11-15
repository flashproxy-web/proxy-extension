import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import type { LucideIcon } from 'lucide-react';

export function NavItem({
  icon: Icon,
  label,
  count,
  active,
  narrow,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  active: boolean;
  narrow: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipHint label={label} side="right">
      <Button
        variant="link"
        size="icon"
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'h-8.5 w-full rounded-lg text-sm font-medium transition-colors hover:no-underline',
          narrow ? 'justify-center' : 'justify-start gap-2.5 px-2.5',
          active ? 'bg-fp-soft text-fp-accent-ink' : 'text-fp-muted hover:text-fp-ink'
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className={narrow ? 'sr-only' : 'min-w-0 flex-1 truncate text-left'}>{label}</span>
        {!narrow && count ? (
          <span className="bg-fp-soft text-fp-accent-ink rounded-md px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums">
            {count}
          </span>
        ) : null}
      </Button>
    </TooltipHint>
  );
}
