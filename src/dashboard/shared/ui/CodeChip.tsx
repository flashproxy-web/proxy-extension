import type { ReactNode } from 'react';

export function CodeChip({ children }: { children: ReactNode }) {
  return (
    <code className="border-fp-line bg-fp-panel text-fp-muted inline-flex h-6 items-center rounded-md border px-2 font-mono text-xs">
      {children}
    </code>
  );
}
