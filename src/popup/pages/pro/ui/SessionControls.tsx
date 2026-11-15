import { RefreshCw } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { SESSIONS } from '@/popup/shared/config';
import { SegmentedControl } from '@/popup/shared/ui/SegmentedControl';
import { send } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

import { StickyTimer } from './StickyTimer';

export function SessionControls() {
  const { snapshot, model } = usePopup();
  const { session } = snapshot.settings;
  return (
    <div className="flex gap-2">
      <SegmentedControl
        value={session}
        options={SESSIONS}
        onChange={(next) => send({ type: 'setSession', session: next })}
        className="seg sess flex-1 grid-cols-2"
        itemClassName="h-6.5 text-xs"
      />
      <Button
        variant="outline"
        className="h-8.5 flex-none gap-1.75 pr-3 pl-2 text-xs font-semibold!"
        title="Get a new exit IP"
        onClick={() => send({ type: 'rotate' })}
      >
        {session === 'sticky' ? (
          <StickyTimer expiresAt={snapshot.runtime.sessionExpiresAt} />
        ) : null}
        <RefreshCw className={cn('text-accent size-3.25!', model.rotating && 'animate-spin')} />
        Rotate
      </Button>
    </div>
  );
}
