import { usePopup } from '@/popup/entities/connection';

import { CityList } from './CityList';
import { CommandPalette } from './CommandPalette';
import { CountryList } from './CountryList';
import { OwnProxyList } from './OwnProxyList';
import { ProfileList } from './ProfileList';

export function SheetBody() {
  const { model, ui } = usePopup();
  switch (ui.sheet) {
    case 'loc':
      if (!model.plan) return null;
      return ui.drill ? <CityList code={ui.drill} /> : <CountryList plan={model.plan} />;
    case 'own':
      return <OwnProxyList />;
    case 'cmd':
      return <CommandPalette />;
    default:
      return <ProfileList />;
  }
}
