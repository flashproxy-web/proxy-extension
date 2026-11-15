import { cn } from '@/shared/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';

import type { Option } from '../model';

const ITEM_CLASS =
  'h-[calc(100%-1px)] min-w-0 flex-1 border border-transparent px-2.5 py-1 text-sm text-fp-muted hover:bg-transparent hover:text-fp-muted data-[spacing=0]:rounded-md dark:text-muted-foreground data-[state=on]:bg-card data-[state=on]:font-semibold data-[state=on]:text-fp-ink dark:data-[state=on]:border-fp-line2 dark:data-[state=on]:bg-card dark:data-[state=on]:text-foreground';

export function SegmentedControl<Value extends string>({
  options,
  value,
  onValueChange,
  fullWidth,
}: {
  options: readonly Option<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  fullWidth?: boolean;
}) {
  const select = (next: string) => {
    if (next) onValueChange(next as Value);
  };

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={select}
      className={cn(
        'border-fp-line bg-fp-panel text-muted-foreground h-9 justify-center rounded-lg border p-[3px]',
        fullWidth && 'w-full'
      )}
    >
      {options.map(([optionValue, label]) => (
        <ToggleGroupItem key={optionValue} value={optionValue} className={ITEM_CLASS}>
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
