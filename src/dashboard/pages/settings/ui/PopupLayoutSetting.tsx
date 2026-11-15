import { LAYOUT_OPTIONS } from '@/dashboard/shared/config';
import { notify } from '@/dashboard/shared/lib/notify';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { SettingRow } from '@/dashboard/shared/ui/SettingRow';
import { call } from '@/shared/api/client';
import type { PopupUi } from '@/shared/model';

export function PopupLayoutSetting({ layout }: { layout: PopupUi }) {
  const change = async (next: PopupUi) => {
    await call('setPopupUi', next);
    notify({ text: next === 'simple' ? 'Popup set to Simple' : 'Popup set to Pro' });
  };

  return (
    <SettingRow
      title="Popup layout"
      description="Simple shows on/off, location and New IP. Pro adds modes, sessions and commands. Your settings stay the same either way."
    >
      <SegmentedControl
        options={LAYOUT_OPTIONS}
        value={layout}
        onValueChange={(next) => void change(next)}
      />
    </SettingRow>
  );
}
