import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import type { ComponentProps, FocusEvent, ReactElement, ReactNode } from 'react';

function openOnlyOnVisibleFocus(event: FocusEvent<HTMLElement>) {
  if (!event.currentTarget.matches(':focus-visible')) event.preventDefault();
}

export function TooltipHint({
  label,
  side,
  children,
}: {
  label: ReactNode;
  side?: ComponentProps<typeof TooltipContent>['side'];
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild onFocus={openOnlyOnVisibleFocus}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
