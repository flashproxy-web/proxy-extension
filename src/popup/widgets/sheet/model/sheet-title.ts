import type { Model, Ui } from '@/popup/entities/connection';
import { countryName } from '@/shared/lib/countries';

export function sheetTitle(model: Model, ui: Ui): string {
  switch (ui.sheet) {
    case 'loc':
      return ui.drill ? countryName(ui.drill) : (model.plan?.name ?? '') + ' locations';
    case 'own':
      return 'My proxies';
    case 'cmd':
      return 'Commands';
    case 'prof':
      return 'Profiles';
    default:
      return '';
  }
}
