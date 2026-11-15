import { Badge } from '@/shared/ui/badge';

import { ChoiceIndicator } from './ChoiceIndicator';
import { ChoiceOption } from './ChoiceOption';

import type { PopupLayout } from '../config';

export function PopupLayoutOption({ layout }: { layout: PopupLayout }) {
  const { key, title, description, icon: Glyph, items, recommended } = layout;

  return (
    <ChoiceOption
      value={key}
      className="border-fp-line data-[state=on]:ring-accent/12 cursor-pointer flex-col items-stretch gap-3 rounded-lg border-[1.5px] p-4.5 data-[state=on]:ring-4"
    >
      <div className="flex items-center gap-3">
        <span className="bg-fp-soft group-data-[state=on]/choice:bg-accent flex size-9.5 flex-none items-center justify-center rounded-md">
          <Glyph
            size={18}
            className="text-accent size-4.5 group-data-[state=on]/choice:text-white"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-base font-semibold">
            {title}
            {recommended ? (
              <Badge className="bg-fp-soft text-fp-accent-ink rounded-full border-0 px-1.75 text-[11px] font-semibold">
                Recommended
              </Badge>
            ) : null}
          </span>
          <span className="text-fp-muted mt-0.5 block text-sm">{description}</span>
        </span>
        <ChoiceIndicator className="border-[1.5px]" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="border-fp-line bg-fp-panel text-fp-muted h-6.5 rounded-full px-2.5 py-0 text-[12.5px] font-normal"
          >
            {item}
          </Badge>
        ))}
      </div>
    </ChoiceOption>
  );
}
