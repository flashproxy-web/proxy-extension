import type { Snapshot } from '@/shared/model';

import { SIGN_IN_ACTIONS, SIGN_IN_COPY } from '../config';

export type SignInStatus = 'signedIn' | 'pending' | 'signedOut';

export interface SignInState {
  status: SignInStatus;
  message: string;
  action: string;
}

function pluralizePlans(count: number): string {
  return `${count} ${count === 1 ? 'plan' : 'plans'}`;
}

export function getSignInState(snapshot: Snapshot | null): SignInState {
  if (snapshot?.account) {
    return {
      status: 'signedIn',
      message: `Signed in as ${snapshot.account.email} · ${pluralizePlans(snapshot.plans.length)} loaded.`,
      action: SIGN_IN_ACTIONS.done,
    };
  }

  if (snapshot?.runtime.signin?.stage === 'load') {
    return { status: 'pending', message: SIGN_IN_COPY.load, action: SIGN_IN_ACTIONS.loading };
  }

  return { status: 'signedOut', message: SIGN_IN_COPY.idle, action: SIGN_IN_ACTIONS.signIn };
}
