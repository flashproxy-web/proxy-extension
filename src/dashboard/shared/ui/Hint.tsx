import type { ReactNode } from 'react';

export function Hint({ children }: { children: ReactNode }) {
  return <span className="text-fp-muted2 text-xs">{children}</span>;
}
