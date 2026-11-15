import { cn } from '@/shared/lib/utils';

import type { ReactNode } from 'react';

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-xl leading-tight font-semibold tracking-tight', className)}>
      {children}
    </h2>
  );
}
