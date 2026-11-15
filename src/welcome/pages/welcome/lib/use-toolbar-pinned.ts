import { IN_EXTENSION } from '@/shared/config';

import { usePolled } from './use-polled';

async function readToolbarPinned(): Promise<boolean> {
  if (!IN_EXTENSION || !chrome.action.getUserSettings) return false;
  const settings = await chrome.action.getUserSettings();
  return settings.isOnToolbar;
}

export function useToolbarPinned(): boolean {
  return usePolled(readToolbarPinned);
}
