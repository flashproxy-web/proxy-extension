import { cn } from '@/shared/lib/utils';
import { ToggleGroupItem } from '@/shared/ui/toggle-group';

import type { ComponentProps } from 'react';

export function ChoiceOption({ className, ...props }: ComponentProps<typeof ToggleGroupItem>) {
  return (
    <ToggleGroupItem
      className={cn(
        'group/choice bg-card text-fp-ink hover:border-accent hover:bg-card hover:text-fp-ink data-[state=on]:border-accent data-[state=on]:bg-card data-[state=on]:text-fp-ink h-auto justify-start text-left font-normal whitespace-normal transition',
        className
      )}
      {...props}
    />
  );
}
