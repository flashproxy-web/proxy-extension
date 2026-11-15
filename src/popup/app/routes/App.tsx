import { TOAST_MS, TOAST_OFFSET_PX } from '@/popup/shared/config';
import { PopupHeader } from '@/popup/widgets/header';
import { useThemeClass } from '@/shared/lib/use-theme-class';
import { Toaster } from '@/shared/ui/sonner';
import { TooltipProvider } from '@/shared/ui/tooltip';

import { usePopupEnvironment } from '../lib/use-popup-environment';
import { useSnapshot } from '../lib/use-snapshot';
import { PopupProvider } from '../model/PopupProvider';

import { PopupBody } from './PopupBody';
import { PopupOverlays } from './PopupOverlays';

export function App() {
  const snapshot = useSnapshot();
  const environment = usePopupEnvironment();
  const dark = useThemeClass(snapshot?.settings.theme);

  if (!snapshot) return <div className="bg-muted h-150 w-95" />;

  return (
    <PopupProvider snapshot={snapshot} environment={environment}>
      <TooltipProvider>
        <div className="bg-muted text-foreground relative flex h-150 w-95 flex-col overflow-hidden">
          <PopupHeader />
          <PopupBody />
          <Toaster
            theme={dark ? 'dark' : 'light'}
            position="bottom-center"
            offset={TOAST_OFFSET_PX}
            closeButton={false}
            duration={TOAST_MS}
            visibleToasts={1}
          />
          <PopupOverlays />
        </div>
      </TooltipProvider>
    </PopupProvider>
  );
}
