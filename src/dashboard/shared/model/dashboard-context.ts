import { createContext, use } from 'react';

import type { Snapshot } from '@/shared/model';

import type { Page } from './index';
import type { SnapshotLookup } from '../lib/snapshot-lookup';

export type Navigate = (page: Page, params?: Record<string, string>) => void;

interface DashboardContextValue {
  snapshot: Snapshot;
  lookup: SnapshotLookup;
  go: Navigate;
  query: URLSearchParams;
  viewportWidth: number;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const dashboard = use(DashboardContext);
  if (!dashboard) throw new Error('useDashboard must be used inside DashboardContext');
  return dashboard;
}
