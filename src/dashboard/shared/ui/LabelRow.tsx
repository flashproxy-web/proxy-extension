import { FormLabel } from '@/shared/ui/form';

import type { ReactNode } from 'react';

export function LabelRow({ label, hint }: { label: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <FormLabel className="text-sm font-semibold">{label}</FormLabel>
      {hint}
    </div>
  );
}
