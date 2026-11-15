import { ExternalLink } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import type { LucideIcon } from 'lucide-react';

export function NavLink({
  icon: Icon,
  label,
  href,
  narrow,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  narrow: boolean;
}) {
  return (
    <TooltipHint label={label} side="right">
      <Button
        asChild
        variant="link"
        size="icon"
        className={cn(
          'text-fp-muted hover:text-fp-ink h-8.5 w-full rounded-lg text-sm font-medium transition-colors hover:no-underline',
          narrow ? 'justify-center' : 'justify-start gap-2.5 px-2.5'
        )}
      >
        <a href={href} target="_blank" rel="noreferrer">
          <Icon className="size-4 shrink-0" />
          <span className={narrow ? 'sr-only' : 'min-w-0 flex-1 truncate text-left'}>{label}</span>
          {narrow ? null : <ExternalLink aria-hidden className="size-3.5 shrink-0" />}
        </a>
      </Button>
    </TooltipHint>
  );
}
