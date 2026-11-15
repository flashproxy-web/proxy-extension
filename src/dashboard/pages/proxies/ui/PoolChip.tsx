import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export function PoolChip({
  count,
  open,
  onClick,
}: {
  count: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="link"
      size="icon"
      aria-expanded={open}
      onClick={onClick}
      className="border-fp-soft-line bg-fp-soft text-fp-accent-ink h-5.5 w-auto gap-1 rounded-full border pr-1.5 pl-2 text-xs font-semibold hover:no-underline"
    >
      pool of {count}
      <ChevronDown
        className={cn('size-3 transition-transform duration-150', open && 'rotate-180')}
      />
    </Button>
  );
}
