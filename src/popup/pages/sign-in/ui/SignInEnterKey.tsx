import { PlugZap } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { send } from '@/shared/api/client';
import { ApiKeyForm } from '@/shared/ui/ApiKeyForm';
import { Button } from '@/shared/ui/button';

import { SECONDARY_ACTION_BUTTON } from '../config';

export function SignInEnterKey() {
  const { openAddProxy } = usePopup();
  const useOwnProxies = () => {
    send({ type: 'signInCancel' });
    openAddProxy();
  };
  return (
    <>
      <ApiKeyForm autoFocus />
      <div className="flex flex-col gap-1.5">
        <Button variant="ghost" className={SECONDARY_ACTION_BUTTON} onClick={useOwnProxies}>
          <PlugZap className="size-4" />
          Use my own proxies instead
        </Button>
        <Button
          variant="ghost"
          className={SECONDARY_ACTION_BUTTON}
          onClick={() => send({ type: 'signInCancel' })}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
