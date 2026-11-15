import { cn } from '@/shared/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';

import { SEG_LIST, SEG_TRIGGER } from '../config';

interface SegmentOption<Value extends string> {
  value: Value;
  label: string;
  tip?: string;
}

export function SegmentedControl<Value extends string>({
  value,
  options,
  onChange,
  className,
  itemClassName,
}: {
  value: Value;
  options: SegmentOption<Value>[];
  onChange: (value: Value) => void;
  className?: string;
  itemClassName?: string;
}) {
  const select = (next: string) => {
    const option = options.find((candidate) => candidate.value === next);
    if (option) onChange(option.value);
  };
  return (
    <ToggleGroup
      type="single"
      spacing={0.5}
      value={value}
      onValueChange={select}
      className={cn(SEG_LIST, className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          title={option.tip}
          className={cn(SEG_TRIGGER, itemClassName)}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
