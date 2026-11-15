import { cn } from '@/shared/lib/utils';

import type { ReactNode } from 'react';

export function Tile({
  color,
  className,
  children,
}: {
  color?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'flex size-4.5 shrink-0 items-center justify-center rounded-sm text-xs font-bold text-white',
        className
      )}
      style={color ? { background: color } : undefined}
    >
      {children}
    </span>
  );
}
