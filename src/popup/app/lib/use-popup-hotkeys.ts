import { useEffect, useEffectEvent } from 'react';

import type { PopupState } from '@/popup/entities/connection';

const TYPING = /INPUT|TEXTAREA/;

export function usePopupHotkeys(state: PopupState, commandBarEnabled: boolean) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const { ui, setUi, openSheet, closeSheet } = state;
    const tag = (event.target as HTMLElement | null)?.tagName ?? '';
    if (event.key === 'Escape') {
      if (ui.sheet) closeSheet();
      else if (ui.srcOpen || ui.acctOpen) setUi({ srcOpen: false, acctOpen: false });
      return;
    }
    if (event.key === '/' && !TYPING.test(tag) && commandBarEnabled) {
      event.preventDefault();
      openSheet('cmd');
    }
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
}
