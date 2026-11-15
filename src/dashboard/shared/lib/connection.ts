import { countryName } from '@/shared/lib/countries';
import type { Snapshot } from '@/shared/model';
import type { StatusTone } from '@/shared/ui/StatusDot';

export interface Connection {
  tone: StatusTone;
  text: string;
  title: string;
  pulse: boolean;
}

const WARN_STATUSES = new Set(['conflict', 'bw', 'expired', 'noplans']);

const OFF_TEXT: Record<string, string> = { direct: 'Direct', system: 'System' };

export function connection(snapshot: Snapshot): Connection {
  const { status } = snapshot.runtime;
  const { settings } = snapshot;
  const countryCode =
    settings.active?.kind === 'fp' ? settings.location.cc : (snapshot.runtime.exit?.cc ?? null);
  if (status === 'on')
    return {
      tone: 'ok',
      text: 'Connected' + (countryCode ? ' · ' + countryCode.toUpperCase() : ''),
      title: countryCode ? countryName(countryCode) : 'Connected',
      pulse: false,
    };
  if (status === 'connecting' || status === 'rotating')
    return { tone: 'busy', text: 'Connecting…', title: 'Connecting', pulse: true };
  if (status === 'off')
    return {
      tone: 'idle',
      text: OFF_TEXT[settings.mode] ?? 'Off',
      title: 'Not routing traffic',
      pulse: false,
    };
  return {
    tone: WARN_STATUSES.has(status) ? 'warn' : 'bad',
    text: 'Needs attention',
    title: 'Open the popup to see what’s wrong',
    pulse: false,
  };
}
