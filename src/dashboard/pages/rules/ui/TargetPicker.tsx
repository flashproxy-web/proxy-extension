import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useDashboard } from '@/dashboard/shared/model';
import { cn } from '@/shared/lib/utils';
import type { RuleTarget } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/shared/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

import { sameTarget, targetKey, targetLabel, type TargetOption } from '../lib/targets';

import { TargetBadge } from './TargetBadge';

export function TargetPicker({
  value,
  options,
  onChange,
  placeholder,
  empty = 'No matches',
}: {
  value: RuleTarget | null;
  options: TargetOption[];
  onChange: (target: RuleTarget) => void;
  placeholder?: string;
  empty?: string;
}) {
  const { lookup } = useDashboard();
  const [open, setOpen] = useState(false);

  const select = (target: RuleTarget) => {
    onChange(target);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 min-w-56 justify-start gap-2 px-2.5 font-medium"
        >
          <TargetBadge target={value} />
          <span className="min-w-0 flex-1 truncate text-left">
            {value ? targetLabel(value, lookup) : placeholder}
          </span>
          <ChevronDown className="text-fp-muted2 size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search proxies and plans" />
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            {options.map(({ target, meta }) => {
              const label = targetLabel(target, lookup);
              const key = targetKey(target);
              return (
                <CommandItem
                  key={key}
                  value={`${label} ${meta} ${key}`}
                  onSelect={() => select(target)}
                  className="gap-2"
                >
                  <TargetBadge target={target} />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <span className="text-fp-muted2 text-xs">{meta}</span>
                  <Check
                    className={cn(
                      'size-3.5',
                      sameTarget(target, value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
