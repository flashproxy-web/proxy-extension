import { useEffect, useState } from 'react';

import { showToast } from '@/popup/shared/lib/show-toast';
import { subscribe } from '@/shared/api/client';
import type { Snapshot } from '@/shared/model';

export function useSnapshot(): Snapshot | null {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  useEffect(() => {
    let unsubscribe = () => {};
    const connect = () => {
      unsubscribe = subscribe(setSnapshot, connect, showToast);
    };
    connect();
    return () => unsubscribe();
  }, []);
  return snapshot;
}
