import { ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import type { ReactNode } from 'react';

export function OnboardingChoice({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-start gap-3.5 rounded-lg! border-[1.5px] px-4 py-4.5 text-left whitespace-normal hover:-translate-y-px hover:shadow-md"
      onClick={onClick}
    >
      <span className="bg-fp-soft flex size-11.5 flex-none items-center justify-center rounded-md">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold tracking-tight">{title}</span>
        <span className="text-fp-muted mt-0.5 block text-sm font-normal">{description}</span>
      </span>
      <ChevronRight className="text-fp-muted2 size-4!" />
    </Button>
  );
}
