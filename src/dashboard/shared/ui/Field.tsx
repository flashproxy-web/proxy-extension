import type { ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        {hint}
      </div>
      {children}
    </div>
  );
}
