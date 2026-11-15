import { LayoutDashboard } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { openDashboard, openPopup } from '../lib/navigation';

export function WelcomeActions() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
      <Button
        size="lg"
        onClick={() => openDashboard()}
        className="shadow-accent/40 h-11.5 rounded-md px-5 text-base shadow-lg"
      >
        <LayoutDashboard size={16} />
        Open the dashboard
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={openPopup}
        className="h-11.5 rounded-md px-5 text-base font-semibold"
      >
        Open the popup
      </Button>
    </div>
  );
}
