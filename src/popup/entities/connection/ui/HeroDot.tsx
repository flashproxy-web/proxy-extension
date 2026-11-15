import { TONE_COLOR } from '@/popup/shared/config';
import { StatusDot, type StatusTone } from '@/shared/ui/StatusDot';

import type { HeroAnimation } from '../model/model';

export function HeroDot({ tone, animation }: { tone: StatusTone; animation: HeroAnimation }) {
  return (
    <span className="relative flex size-2">
      {animation === 'pulse' ? (
        <span
          className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
          style={{ background: TONE_COLOR[tone] }}
        />
      ) : null}
      <StatusDot tone={tone} pulse={animation === 'blink'} className="relative" />
    </span>
  );
}
