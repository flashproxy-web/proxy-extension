import { Button } from '@/shared/ui/button';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';

import { openDashboard } from '../lib/navigation';

export function WelcomeHeader() {
  return (
    <header className="mx-auto flex max-w-240 items-center gap-2.5 px-6 pt-6">
      <FlashProxyStar />
      <span className="text-base font-bold tracking-tight">FlashProxy</span>
      <span className="text-fp-muted2 text-sm">Proxy Manager</span>
      <span className="flex-1" />
      <Button
        variant="link"
        className="text-accent h-auto p-0 font-semibold"
        onClick={() => openDashboard()}
      >
        Open dashboard
      </Button>
    </header>
  );
}
