import { DEFAULT_LOCALE, LATENCY_MS } from '../config';

const UTC_MIDNIGHT = 'T00:00:00Z';
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function latencyColor(ms: number | null | undefined): string {
  if (ms == null) return 'var(--fp-muted2)';
  return ms < LATENCY_MS.fast
    ? 'var(--fp-green)'
    : ms < LATENCY_MS.slow
      ? 'var(--fp-amber)'
      : 'var(--fp-red)';
}

export function fmtGb(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}

export function fmtDay(iso: string | undefined): string {
  if (!iso) return '';
  // The API sends full timestamps (expires_at); a bare YYYY-MM-DD is read as UTC midnight.
  const date = new Date(DATE_ONLY.test(iso) ? iso + UTC_MIDNIGHT : iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(DEFAULT_LOCALE, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
