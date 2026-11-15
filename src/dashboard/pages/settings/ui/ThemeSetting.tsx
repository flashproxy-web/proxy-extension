import { THEME_OPTIONS } from '@/dashboard/shared/config';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { SettingRow } from '@/dashboard/shared/ui/SettingRow';
import { call } from '@/shared/api/client';
import type { Theme } from '@/shared/model';

export function ThemeSetting({ theme }: { theme: Theme }) {
  return (
    <SettingRow title="Theme" description="Follows your browser by default.">
      <SegmentedControl
        options={THEME_OPTIONS}
        value={theme}
        onValueChange={(next) => void call('setTheme', next)}
      />
    </SettingRow>
  );
}
