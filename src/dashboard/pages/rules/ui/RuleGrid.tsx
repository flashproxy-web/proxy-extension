import { cn } from '@/shared/lib/utils';

import type { ComponentProps } from 'react';

export function RuleGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-fp-line grid grid-cols-[1.5rem_1.5rem_minmax(0,1fr)_minmax(9rem,15rem)_2.25rem_1.75rem] items-center gap-3 border-t px-4 py-3 transition-colors',
        className
      )}
      {...props}
    />
  );
}
