import type { Connection } from '@/dashboard/shared/lib/connection';
import { StatusDot } from '@/shared/ui/StatusDot';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function ConnectionPill({ connection }: { connection: Connection }) {
  return (
    <TooltipHint label={connection.title}>
      <span className="border-fp-line bg-card text-fp-muted flex h-8.5 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium whitespace-nowrap">
        <StatusDot tone={connection.tone} pulse={connection.pulse} className="size-1.5" />
        {connection.text}
      </span>
    </TooltipHint>
  );
}
