import { LoaderCircle } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function TestRunBar({
  done,
  total,
  onStop,
}: {
  done: number;
  total: number;
  onStop: () => void;
}) {
  const progress = Math.round(((done + 1) / total) * 100);

  return (
    <div className="border-fp-soft-line bg-fp-soft mb-3 flex items-center gap-3 rounded-lg border px-3.5 py-2.5">
      <LoaderCircle className="text-accent size-4 animate-spin" />
      <span className="text-fp-accent-ink text-sm font-medium whitespace-nowrap tabular-nums">
        Testing {Math.min(done + 1, total)} of {total} proxies…
      </span>
      <div className="bg-card h-1.5 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full transition-[width] duration-300"
          style={{ width: progress + '%' }}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={onStop}>
        Stop
      </Button>
    </div>
  );
}
