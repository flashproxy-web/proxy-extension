import { useState } from 'react';

import { useToolbarPinned } from '../lib/use-toolbar-pinned';

import { useSnapshot } from './snapshot';

import type { SourceKey } from '../config';

function inferSource(signedIn: boolean, hasOwnProxies: boolean): SourceKey | null {
  if (signedIn) return 'fp';
  if (hasOwnProxies) return 'own';
  return null;
}

export function useSetupProgress() {
  const snapshot = useSnapshot();
  const toolbarPinned = useToolbarPinned();
  const [demoPinned, setDemoPinned] = useState(false);
  const [pickedSource, setPickedSource] = useState<SourceKey | null>(null);

  const signedIn = Boolean(snapshot?.account);
  const hasOwnProxies = (snapshot?.ownProxies.length ?? 0) > 0;
  const pinned = demoPinned || toolbarPinned;
  const source = pickedSource ?? inferSource(signedIn, hasOwnProxies);
  const sourceDone = source === 'own' || (source === 'fp' && signedIn);

  return {
    pinned,
    demoPinned,
    toggleDemoPin: () => setDemoPinned((current) => !current),
    source,
    sourceDone,
    chooseSource: setPickedSource,
    completedSteps: Number(pinned) + Number(sourceDone),
  };
}
