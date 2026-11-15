import { ChoiceIndicator } from './ChoiceIndicator';
import { ChoiceOption } from './ChoiceOption';

import type { SourceOption } from '../config';

export function SourceChoice({ option }: { option: SourceOption }) {
  const { key, title, description, icon: Glyph } = option;

  return (
    <ChoiceOption
      value={key}
      className="border-fp-line data-[state=on]:bg-fp-soft data-[state=on]:ring-accent/10 gap-3.5 rounded-lg border-2 px-4 py-4.5 data-[state=on]:ring-4"
    >
      <span className="bg-fp-soft flex size-11.5 flex-none items-center justify-center rounded-md">
        <Glyph size={22} className="text-accent size-5.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold tracking-tight">{title}</span>
        <span className="text-fp-muted mt-0.5 block text-sm">{description}</span>
      </span>
      <ChoiceIndicator />
    </ChoiceOption>
  );
}
