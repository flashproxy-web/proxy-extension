import { Card } from '@/shared/ui/card';

import { Kicker } from './Kicker';
import { SectionTitle } from './SectionTitle';

import type { ReactNode } from 'react';

export function SectionCard({
  kicker,
  title,
  aside,
  children,
}: {
  kicker: string;
  title: string;
  aside: string;
  children: ReactNode;
}) {
  return (
    <Card className="fp-card block rounded-xl p-7 shadow-none">
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>{kicker}</Kicker>
          <SectionTitle className="mt-2">{title}</SectionTitle>
        </div>
        <span className="text-fp-muted2 text-sm">{aside}</span>
      </div>
      {children}
    </Card>
  );
}
