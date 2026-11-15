import { cn } from '@/shared/lib/utils';
import { Command, CommandInput, CommandList } from '@/shared/ui/command';

import type { ReactNode } from 'react';

export function SheetCommand({
  query,
  onQuery,
  placeholder,
  hint,
  empty,
  children,
}: {
  query: string;
  onQuery: (query: string) => void;
  placeholder?: string;
  hint?: string;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <Command shouldFilter={false} className="min-h-0 flex-1 rounded-none bg-transparent">
      {placeholder ? (
        <div className="border-fp-line2 bg-fp-field focus-within:border-accent focus-within:ring-accent/15 relative mx-3 mb-2.5 flex-none rounded-sm border focus-within:ring-3 [&_[data-slot=command-input-wrapper]]:h-10 [&_[data-slot=command-input-wrapper]]:border-0">
          <CommandInput
            autoFocus
            value={query}
            placeholder={placeholder}
            className={cn('text-sm', hint && 'pr-24')}
            onValueChange={onQuery}
          />
          <span className="text-fp-muted2 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs whitespace-nowrap">
            {hint}
          </span>
        </div>
      ) : null}
      <CommandList className="max-h-none min-h-0 flex-1 px-2 pb-3 [scrollbar-width:thin]">
        {children}
        {empty ? (
          <div className="text-fp-muted2 px-2 py-6 text-center text-sm">
            No matches for “{query}”
          </div>
        ) : null}
      </CommandList>
    </Command>
  );
}
