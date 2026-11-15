import type { IspChoice } from '@/shared/model';

export type SheetKind = 'loc' | 'own' | 'cmd' | 'prof';

export interface Ui {
  sheet: SheetKind | null;
  query: string;
  drill: string | null;
  isp: IspChoice;
  srcOpen: boolean;
  openGroup: string | null;
  acctOpen: boolean;
  /** Simple's Connect via sheet. */
  via: boolean;
}

export const INITIAL_UI: Ui = {
  sheet: null,
  query: '',
  drill: null,
  isp: 'any',
  srcOpen: false,
  openGroup: null,
  acctOpen: false,
  via: false,
};
