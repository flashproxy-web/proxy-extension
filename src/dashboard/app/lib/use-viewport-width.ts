import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

const width = () => window.innerWidth;

export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, width);
}
