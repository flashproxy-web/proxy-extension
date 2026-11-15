import type { ReactNode } from 'react';

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="text-fp-muted2 font-mono text-xs tracking-wider uppercase">{children}</span>
  );
}
