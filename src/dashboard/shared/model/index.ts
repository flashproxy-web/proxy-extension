import type { LucideIcon } from 'lucide-react';

export type Page = 'proxies' | 'rules' | 'settings';

export interface DashToast {
  text: string;
  icon?: LucideIcon;
  tone?: 'success' | 'error' | 'warning' | 'info';
  undo?: () => void;
}

export type Option<Value extends string> = readonly [Value, string];

export { DashboardContext, useDashboard } from './dashboard-context';
export type { Navigate } from './dashboard-context';
