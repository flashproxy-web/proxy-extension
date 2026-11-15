import { usePopup } from '@/popup/entities/connection';
import { LAYOUTS } from '@/popup/shared/config';
import { SegmentedControl } from '@/popup/shared/ui/SegmentedControl';

/** Simple / Pro switch in the popup header. It only changes what the popup shows. */
export function LayoutSwitch() {
  const { snapshot, setLayout } = usePopup();
  return (
    <SegmentedControl
      value={snapshot.settings.ui}
      options={LAYOUTS}
      onChange={setLayout}
      className="ui-seg w-auto flex-none grid-cols-2 rounded-lg p-0.5"
      itemClassName="h-6 px-2 text-[11.5px]"
    />
  );
}
