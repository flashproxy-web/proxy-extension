import { flagUrl } from '../lib/flags';
import { cn } from '../lib/utils';

const FLAG_SIZE = {
  xs: 'h-3.5 w-5 rounded-xs',
  sm: 'h-5 w-7 rounded-[4px]',
} as const;

const FLAG_BASE = 'block shrink-0 object-cover shadow-[0_0_0_1px_rgba(17,13,31,.08)]';

export function FlagTile({
  cc,
  size = 'sm',
  className,
}: {
  cc: string | null | undefined;
  size?: keyof typeof FLAG_SIZE;
  className?: string;
}) {
  const src = cc ? flagUrl(cc) : undefined;
  if (!src) {
    return (
      <span aria-hidden className={cn(FLAG_BASE, 'bg-fp-panel', FLAG_SIZE[size], className)} />
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={28}
      height={20}
      loading="lazy"
      className={cn(FLAG_BASE, FLAG_SIZE[size], className)}
    />
  );
}
