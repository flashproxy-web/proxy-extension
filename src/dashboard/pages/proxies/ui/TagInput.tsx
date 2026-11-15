import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import type { KeyboardEvent } from 'react';

const ADD_KEYS = new Set(['Enter', ',']);

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const tag = input.trim().toLowerCase();
    if (ADD_KEYS.has(event.key) && tag) {
      event.preventDefault();
      if (!value.includes(tag)) onChange([...value, tag]);
      setInput('');
    } else if (event.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="border-fp-line2 bg-fp-field focus-within:border-accent flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1">
      {value.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          onRemove={() => onChange(value.filter((other) => other !== tag))}
        />
      ))}
      <input
        value={input}
        onChange={(event) => setInput(event.target.value.replace(',', ''))}
        onKeyDown={handleKey}
        placeholder={value.length ? 'Add tag' : 'Type a tag and press Enter'}
        aria-label="Tags"
        className="placeholder:text-muted-foreground h-6.5 min-w-28 flex-1 border-0 bg-transparent text-sm outline-none!"
      />
    </div>
  );
}

function TagChip({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <span className="bg-fp-soft text-fp-accent-ink inline-flex h-6 items-center gap-0.5 rounded-md pr-0.5 pl-2 text-xs font-medium">
      {tag}
      <TooltipHint label="Remove tag">
        <Button
          type="button"
          variant="link"
          size="icon"
          aria-label={`Remove tag ${tag}`}
          onClick={onRemove}
          className="size-4.5 rounded text-inherit"
        >
          <X className="size-3" />
        </Button>
      </TooltipHint>
    </span>
  );
}
