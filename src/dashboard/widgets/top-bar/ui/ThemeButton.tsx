import { NEXT_THEME, THEME_ICON } from '@/dashboard/shared/config';
import { capitalize } from '@/dashboard/shared/lib/format';
import { notify } from '@/dashboard/shared/lib/notify';
import { call } from '@/shared/api/client';
import type { Theme } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function ThemeButton({ theme, disabled }: { theme: Theme; disabled: boolean }) {
  const Icon = THEME_ICON[theme];
  const label = `Theme: ${theme} (click to change)`;

  const cycle = () => {
    const next = NEXT_THEME[theme];
    void call('setTheme', next);
    notify({ text: 'Theme: ' + capitalize(next), icon: THEME_ICON[next], tone: 'info' });
  };

  return (
    <TooltipHint label={label}>
      <Button
        variant="link"
        size="icon"
        aria-label={label}
        onClick={cycle}
        disabled={disabled}
        className="border-fp-line bg-card text-fp-muted hover:border-fp-line2 hover:text-fp-ink size-8.5 rounded-lg border transition-colors"
      >
        <Icon className="size-4" />
      </Button>
    </TooltipHint>
  );
}
