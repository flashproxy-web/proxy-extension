import { Toggle } from '@/shared/ui/toggle';

import { Tile } from './Tile';

export function ChipOption({
  selected,
  color,
  initial,
  label,
  onSelect,
}: {
  selected: boolean;
  color: string;
  initial: string;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Toggle
      pressed={selected}
      onPressedChange={onSelect}
      className="border-fp-line2 bg-card text-fp-ink hover:border-accent hover:bg-card hover:text-fp-ink data-[state=on]:border-accent data-[state=on]:bg-fp-soft data-[state=on]:text-fp-ink data-[state=on]:ring-accent/12 h-8 min-w-0 justify-start gap-2 rounded-lg border pr-3 pl-1.5 transition-colors data-[state=on]:ring-3"
    >
      <Tile color={color} className="size-5">
        {initial}
      </Tile>
      {label}
    </Toggle>
  );
}
