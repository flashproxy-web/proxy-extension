import { STICKY_RING_RADIUS, STICKY_RING_SIZE } from '@/popup/shared/config';
import { useNow } from '@/popup/shared/lib/use-now';
import { STICKY_SECONDS } from '@/shared/config';

const CIRCUMFERENCE = 2 * Math.PI * STICKY_RING_RADIUS;
const CENTER = STICKY_RING_SIZE / 2;

function secondsLeft(expiresAt: number | null | undefined, now: number): number {
  if (!expiresAt) return STICKY_SECONDS;
  return Math.max(0, Math.min(STICKY_SECONDS, Math.ceil((expiresAt - now) / 1000)));
}

export function StickyTimer({ expiresAt }: { expiresAt: number | null | undefined }) {
  const left = secondsLeft(expiresAt, useNow());
  const offset = (CIRCUMFERENCE * (1 - left / STICKY_SECONDS)).toFixed(2);
  return (
    <>
      <svg
        viewBox={`0 0 ${STICKY_RING_SIZE} ${STICKY_RING_SIZE}`}
        aria-hidden="true"
        className="block size-5.5! flex-none -rotate-90"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={STICKY_RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
          className="stroke-fp-line"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={STICKY_RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-accent transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="text-fp-muted min-w-8.5 font-mono text-xs">
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
      </span>
    </>
  );
}
