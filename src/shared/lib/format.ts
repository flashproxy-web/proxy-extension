import { DEFAULT_LOCALE, LATENCY_MS } from '../config';

const UTC_MIDNIGHT = 'T00:00:00Z';

export function latencyColor(ms: number | null | undefined): string {
  if (ms == null) return 'var(--fp-muted2)';
  return ms < LATENCY_MS.fast ? 'var(--fp-green)' : ms < LATENCY_MS.slow ? 'var(--fp-amber)' : 'var(--fp-red)';
}

export function fmtGb(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}

export function fmtDay(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso + UTC_MIDNIGHT).toLocaleDateString(DEFAULT_LOCALE, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
