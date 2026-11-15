import { createContext, use, useEffect, useState } from 'react';

import { subscribe } from '@/shared/api/client';
import type { Snapshot } from '@/shared/model';

export const SnapshotContext = createContext<Snapshot | null>(null);

export function useSnapshot(): Snapshot | null {
  return use(SnapshotContext);
}

export function useSnapshotSubscription(): Snapshot | null {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  useEffect(() => subscribe(setSnapshot), []);
  return snapshot;
}
