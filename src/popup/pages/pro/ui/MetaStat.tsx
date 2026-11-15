import { cn } from '@/shared/lib/utils';

import type { CSSProperties, ReactNode } from 'react';

export function MetaStat({
  label,
  children,
  className,
  style,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="min-w-0">
      <div className="text-fp-muted2 text-xs">{label}</div>
      <div className={cn('mt-0.5 truncate text-xs tabular-nums', className)} style={style}>
        {children}
      </div>
    </div>
  );
}
