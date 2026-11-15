import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

const BAR_CLASS = 'h-2.5 bg-fp-panel';
const CARDS = ['first', 'second', 'third'];
const ROWS = ['first', 'second', 'third'];
const CELLS = [
  { key: 'label', width: 'w-4/5' },
  { key: 'host', width: 'w-3/4' },
  { key: 'protocol', width: 'w-3/5' },
  { key: 'country', width: 'w-1/2' },
  { key: 'health', width: 'w-3/5' },
];

export function LoadingState({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      {CARDS.map((card) => (
        <Card key={card} className="fp-card gap-3.5 p-4.5">
          <div className="flex items-center gap-3">
            <Skeleton className={cn(BAR_CLASS, 'size-8.5 shrink-0 rounded-lg')} />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className={cn(BAR_CLASS, 'h-3 w-1/3')} />
              <Skeleton className={cn(BAR_CLASS, 'w-1/5')} />
            </div>
            <Skeleton className={cn(BAR_CLASS, 'h-6 w-18 rounded-full')} />
          </div>
          {ROWS.map((row) => (
            <div key={row} className="grid grid-cols-5 gap-4">
              {CELLS.map((cell) => (
                <Skeleton key={cell.key} className={cn(BAR_CLASS, cell.width)} />
              ))}
            </div>
          ))}
        </Card>
      ))}
      <div className="text-fp-muted2 text-center text-sm">{label}</div>
    </div>
  );
}
