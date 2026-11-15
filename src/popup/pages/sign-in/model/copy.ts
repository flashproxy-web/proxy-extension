import type { SignIn } from '@/shared/model';

import { STAGE_COPY } from '../config';

export function signInCopy(signIn: SignIn): { title: string; description: string } {
  const copy = STAGE_COPY[signIn.stage];
  const plansReady =
    signIn.stage === 'load' && signIn.plans.length > 0 && signIn.step >= signIn.plans.length;
  if (!plansReady) return copy;
  return { ...copy, description: `${signIn.plans.length} plans ready. Connecting…` };
}
