import { useState } from 'react';

import {
  INITIAL_UI,
  PopupStateContext,
  derive,
  type PopupState,
  type SheetKind,
  type Ui,
} from '@/popup/entities/connection';
import type { PopupContext } from '@/popup/shared/api';
import { OPENING_ADD_PROXY, OPENING_DASHBOARD } from '@/popup/shared/config';
import { showToast } from '@/popup/shared/lib/show-toast';
import { send } from '@/shared/api/client';
import { DASH_ROUTE, TOAST_INFO } from '@/shared/config';
import type { PopupUi, Snapshot } from '@/shared/model';

import { usePopupHotkeys } from '../lib/use-popup-hotkeys';

import type { ReactNode } from 'react';

const openDash = (query: string = DASH_ROUTE.proxies, toastText: string = OPENING_DASHBOARD) => {
  showToast({ text: toastText, icon: 'external-link', color: TOAST_INFO });
  send({ type: 'open', target: { kind: 'dashboard', query } });
};

const openAddProxy = () => openDash(DASH_ROUTE.addProxy, OPENING_ADD_PROXY);

export function PopupProvider({
  snapshot,
  environment,
  children,
}: {
  snapshot: Snapshot;
  environment: PopupContext;
  children: ReactNode;
}) {
  const [ui, setUiState] = useState<Ui>(INITIAL_UI);
  const model = derive(snapshot);

  const setUi = (patch: Partial<Ui>) => setUiState((current) => ({ ...current, ...patch }));
  // Switching layouts only changes what is shown; close whatever is open.
  const setLayout = (layout: PopupUi) => {
    if (layout === snapshot.settings.ui) return;
    setUiState(INITIAL_UI);
    send({ type: 'setUi', ui: layout });
  };

  const state: PopupState = {
    snapshot,
    model,
    ui,
    tab: environment.tab,
    setUi,
    setQuery: (query) => setUi({ query }),
    openSheet: (kind: SheetKind) => setUi({ sheet: kind, query: '', drill: null, srcOpen: false }),
    closeSheet: () => setUi({ sheet: null, query: '', drill: null }),
    openVia: () => setUi({ via: true, query: '', sheet: null, srcOpen: false, acctOpen: false }),
    closeVia: () => setUi({ via: false, query: '' }),
    setLayout,
    openDash,
    openAddProxy,
    toast: showToast,
  };

  // The / command bar is a Pro feature.
  const commandBarEnabled =
    model.hasAny && !snapshot.runtime.signin && snapshot.settings.ui === 'pro';
  usePopupHotkeys(state, commandBarEnabled);

  return <PopupStateContext value={state}>{children}</PopupStateContext>;
}
