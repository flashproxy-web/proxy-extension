import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';

import type { ComponentProps } from 'react';

const TONE_CLASS = {
  ok: 'bg-fp-green/12 text-fp-green',
  bad: 'bg-fp-red/10 text-fp-red',
  warn: 'bg-fp-amber/12 text-fp-amber',
  soft: 'bg-fp-soft text-fp-accent-ink',
  muted: 'bg-fp-panel text-fp-muted',
} as const;

type BadgeTone = keyof typeof TONE_CLASS;

export function ToneBadge({
  tone,
  className,
  ...props
}: Omit<ComponentProps<typeof Badge>, 'variant'> & { tone: BadgeTone }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5.5 gap-1 rounded-full border-0 px-2 font-semibold [&_svg]:size-3',
        TONE_CLASS[tone],
        className
      )}
      {...props}
    />
  );
}
