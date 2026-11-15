import { useEffect, useState } from 'react';

import { POLL_INTERVAL_MS } from '../config';

/** Poll a Chrome-owned flag the extension can read but not change. */
export function usePolled(read: () => Promise<boolean>, intervalMs = POLL_INTERVAL_MS): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    let active = true;

    const poll = () => {
      read()
        .then((nextValue) => {
          if (active) setValue(nextValue);
        })
        .catch(() => undefined);
    };

    poll();
    const timer = setInterval(poll, intervalMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [read, intervalMs]);

  return value;
}
