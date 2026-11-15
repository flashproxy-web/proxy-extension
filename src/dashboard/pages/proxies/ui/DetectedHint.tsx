import { Sparkles } from 'lucide-react';

export function DetectedHint({ isNew }: { isNew: boolean }) {
  return (
    <span className="text-fp-green flex items-center gap-1 text-xs font-medium">
      <Sparkles className="size-3" />
      Detected from host{isNew ? ' · new provider' : ''}
    </span>
  );
}
