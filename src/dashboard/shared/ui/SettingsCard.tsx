import { Card } from '@/shared/ui/card';

import type { ReactNode } from 'react';

export function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="fp-card mb-4 gap-0 py-0">
      <div className="px-5 py-4 text-base font-semibold">{title}</div>
      {children}
    </Card>
  );
}
