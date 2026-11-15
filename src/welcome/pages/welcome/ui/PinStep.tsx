import { CircleCheck, MousePointerClick } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';

import { PIN_HINTS, STEP_COPY } from '../config';

import { ExtensionsMenu } from './ExtensionsMenu';
import { StepCard } from './StepCard';
import { ToolbarMock } from './ToolbarMock';

function pinHint(pinned: boolean, menuOpen: boolean): string {
  if (pinned) return PIN_HINTS.pinned;
  if (menuOpen) return PIN_HINTS.menuOpen;
  return PIN_HINTS.idle;
}

export function PinStep({
  pinned,
  demoPinned,
  onToggleDemoPin,
}: {
  pinned: boolean;
  demoPinned: boolean;
  onToggleDemoPin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTogglePin = () => {
    onToggleDemoPin();
    setMenuOpen(demoPinned);
  };

  return (
    <StepCard tone={pinned ? 'done' : 'todo'} label="1" copy={STEP_COPY.pin}>
      <div className="border-fp-line bg-fp-panel relative rounded-lg border p-4">
        <ToolbarMock
          pinned={pinned}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
        />
        {menuOpen ? <ExtensionsMenu pinned={pinned} onTogglePin={handleTogglePin} /> : null}
        <div
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            menuOpen ? 'mt-30' : 'mt-3.5',
            pinned ? 'text-fp-green' : 'text-fp-muted'
          )}
        >
          {pinned ? <CircleCheck size={14} /> : <MousePointerClick size={14} />}
          {pinHint(pinned, menuOpen)}
        </div>
      </div>
    </StepCard>
  );
}
