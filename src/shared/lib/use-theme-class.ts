import { useEffect, useSyncExternalStore } from 'react';

import type { Theme } from '../model';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const systemPrefersDark = () => window.matchMedia(DARK_QUERY).matches;

export function useThemeClass(theme: Theme | undefined): boolean {
  const systemDark = useSyncExternalStore(subscribe, systemPrefersDark);
  const dark = theme === 'dark' || ((theme ?? 'system') === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return dark;
}
