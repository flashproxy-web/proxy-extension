import { CircleCheck, CircleX, LoaderCircle } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { FlagTile } from '@/shared/ui/FlagTile';

import { describeDraftTest, type DraftTest } from '../model/draft-test';

const BOX = {
  run: 'border-fp-soft-line bg-fp-soft',
  ok: 'border-fp-green/30 bg-fp-green/5',
  err: 'border-fp-red/30 bg-fp-red/5',
} as const;
const TITLE = { run: 'text-accent', ok: 'text-fp-green', err: 'text-fp-red' } as const;
const ICON = {
  run: <LoaderCircle className="text-accent size-4 shrink-0 animate-spin" />,
  ok: <CircleCheck className="text-fp-green size-4 shrink-0" />,
  err: <CircleX className="text-fp-red size-4 shrink-0" />,
} as const;

export function TestStatus({ test, host }: { test: DraftTest; host: string }) {
  const { title, detail } = describeDraftTest(test, host);

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border px-3.5 py-3', BOX[test.status])}>
      {ICON[test.status]}
      <div className="min-w-0 flex-1">
        <div className={cn('text-sm font-semibold', TITLE[test.status])}>{title}</div>
        <div className="text-fp-muted mt-0.5 text-xs">{detail}</div>
      </div>
      {test.status === 'ok' ? (
        <div className="flex items-center gap-2">
          {test.result.exit.cc ? <FlagTile cc={test.result.exit.cc} size="xs" /> : null}
          <span className="text-base font-semibold tabular-nums">{test.result.ms} ms</span>
        </div>
      ) : null}
    </div>
  );
}
