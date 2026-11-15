import { useEffect, useState } from 'react';

import { WORKER_TIMEOUT_MS } from '@/dashboard/shared/config';
import { subscribe } from '@/shared/api/client';
import type { Snapshot } from '@/shared/model';

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let received = false;
    const unsubscribe = subscribe(
      (next) => {
        received = true;
        setSnapshot(next);
      },
      () => setFailed(true)
    );
    const timeout = setTimeout(() => {
      if (!received) setFailed(true);
    }, WORKER_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [attempt]);

  const retry = () => {
    setFailed(false);
    setAttempt((count) => count + 1);
  };

  return { snapshot, failed, retry };
}
