import { send } from '@/shared/api/client';
import { DASH_ROUTE } from '@/shared/config';

import { getSignInState } from '../model/sign-in';
import { useSnapshot } from '../model/snapshot';

import { StepBanner } from './StepBanner';

export function SignInBanner() {
  const { status, message, action } = getSignInState(useSnapshot());

  const handleAction = () => {
    if (status !== 'signedOut') return;
    send({ type: 'open', target: { kind: 'dashboard', query: DASH_ROUTE.settings } });
  };

  return (
    <StepBanner
      message={message}
      action={action}
      disabled={status !== 'signedOut'}
      onAction={handleAction}
    />
  );
}
