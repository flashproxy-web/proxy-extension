import { cn } from '../lib/utils';

export type StatusTone = 'ok' | 'busy' | 'warn' | 'bad' | 'idle';

const TONE_CLASS: Record<StatusTone, string> = {
  ok: 'bg-fp-green',
  busy: 'bg-accent',
  warn: 'bg-fp-amber',
  bad: 'bg-fp-red',
  idle: 'bg-fp-muted2',
};

export function StatusDot({
  tone,
  pulse = false,
  className,
}: {
  tone: StatusTone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-2 shrink-0 rounded-full',
        TONE_CLASS[tone],
        pulse && 'animate-pulse',
        className
      )}
    />
  );
}
