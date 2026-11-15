import { createContext, use } from 'react';

export interface ProxiesPageActions {
  openPools: ReadonlySet<string>;
  togglePool: (proxyId: string) => void;
  editProxy: (proxyId: string) => void;
  addProxy: (providerId?: string | null) => void;
  openImport: () => void;
}

export const ProxiesPageContext = createContext<ProxiesPageActions | null>(null);

export function useProxiesPage(): ProxiesPageActions {
  const actions = use(ProxiesPageContext);
  if (!actions) throw new Error('useProxiesPage must be used inside ProxiesPageContext');
  return actions;
}
