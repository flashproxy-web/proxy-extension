import { createContext, use } from 'react';

import type { PopupContext } from '@/popup/shared/api';
import type { PopupUi, Snapshot, Toast } from '@/shared/model';

import type { Model } from './model';
import type { SheetKind, Ui } from './types';

export type ActiveTab = NonNullable<PopupContext['tab']>;

export interface PopupState {
  snapshot: Snapshot;
  model: Model;
  ui: Ui;
  tab: ActiveTab | null;
  setUi: (patch: Partial<Ui>) => void;
  setQuery: (query: string) => void;
  openSheet: (kind: SheetKind) => void;
  closeSheet: () => void;
  openVia: () => void;
  closeVia: () => void;
  setLayout: (layout: PopupUi) => void;
  openDash: (query?: string, toastText?: string) => void;
  openAddProxy: () => void;
  toast: (toast: Toast) => void;
}

export const PopupStateContext = createContext<PopupState | null>(null);

export function usePopup(): PopupState {
  const state = use(PopupStateContext);
  if (!state) throw new Error('usePopup must be used inside PopupProvider');
  return state;
}
