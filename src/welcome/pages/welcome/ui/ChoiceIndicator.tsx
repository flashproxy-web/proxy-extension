import { cn } from '@/shared/lib/utils';

export function ChoiceIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'border-fp-line2 group-data-[state=on]/choice:border-accent group-data-[state=on]/choice:bg-accent group-data-[state=on]/choice:ring-card size-5 flex-none rounded-full border-2 group-data-[state=on]/choice:ring-4 group-data-[state=on]/choice:ring-inset',
        className
      )}
    />
  );
}
