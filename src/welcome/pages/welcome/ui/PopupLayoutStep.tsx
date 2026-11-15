import { call } from '@/shared/api/client';
import { ToggleGroup } from '@/shared/ui/toggle-group';

import { POPUP_LAYOUTS } from '../config';
import { useSnapshot } from '../model/snapshot';

import { PopupLayoutOption } from './PopupLayoutOption';
import { SectionCard } from './SectionCard';

/** "How much do you want to see?" — the same Simple / Pro choice as the popup header. */
export function PopupLayoutStep() {
  const snapshot = useSnapshot();

  const handleValueChange = (value: string) => {
    const layout = POPUP_LAYOUTS.find((option) => option.key === value);
    if (layout) void call('setPopupUi', layout.key);
  };

  return (
    <SectionCard
      kicker="Your popup"
      title="How much do you want to see?"
      aside="Switch any time in the popup header or in Settings."
    >
      <ToggleGroup
        type="single"
        spacing={3}
        value={snapshot?.settings.ui ?? 'simple'}
        onValueChange={handleValueChange}
        aria-label="Popup layout"
        className="grid w-full grid-cols-1 items-stretch md:grid-cols-2"
      >
        {POPUP_LAYOUTS.map((layout) => (
          <PopupLayoutOption key={layout.key} layout={layout} />
        ))}
      </ToggleGroup>
    </SectionCard>
  );
}
