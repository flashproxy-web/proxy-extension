import { usePopup } from '@/popup/entities/connection';
import { ConnectViaSheet } from '@/popup/pages/simple';
import { PopupSheet } from '@/popup/widgets/sheet';

export function PopupOverlays() {
  const { snapshot, ui } = usePopup();
  const simple = snapshot.settings.ui === 'simple';
  return (
    <>
      {ui.sheet ? <PopupSheet /> : null}
      {ui.via && simple ? <ConnectViaSheet /> : null}
    </>
  );
}
