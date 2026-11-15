import { usePopup, type Model } from '@/popup/entities/connection';
import { COLOR, SECTION } from '@/popup/shared/config';
import { SheetCommand } from '@/popup/shared/ui/SheetCommand';
import { SheetRow, type RowSpec } from '@/popup/shared/ui/SheetRow';
import { send } from '@/shared/api/client';
import { countryName } from '@/shared/lib/countries';
import { cn } from '@/shared/lib/utils';
import type { GeoInfo, IspChoice } from '@/shared/model';

import { IspChips } from './IspChips';

const NO_GEO: GeoInfo = { cities: [], isp: '', asn: '' };

function cityRows(
  model: Model,
  code: string,
  geo: GeoInfo,
  query: string,
  pickCity: (city: string | null) => void
): RowSpec[] {
  const entries = [
    { city: null, subtitle: 'Best available exit in ' + countryName(code) },
    ...geo.cities.map((city) => ({ city, subtitle: `${geo.isp} · ${geo.asn}` })),
  ];
  return entries
    .filter((entry) => !query || (entry.city ?? 'Any city').toLowerCase().includes(query))
    .map((entry) => {
      const selected = model.location.cc === code && model.location.city === entry.city;
      return {
        key: entry.city ?? '*',
        title: entry.city ?? 'Any city',
        subtitle: entry.subtitle,
        lead: {
          icon: selected ? 'check' : 'map-pin',
          background: COLOR.panel,
          color: selected ? COLOR.accent : COLOR.muted2,
        },
        selected,
        run: () => pickCity(entry.city),
      };
    });
}

export function CityList({ code }: { code: string }) {
  const { snapshot, model, ui, setUi, setQuery, closeSheet } = usePopup();
  const query = ui.query.trim().toLowerCase();
  const geo = snapshot.geo[code] ?? NO_GEO;
  const pickCity = (city: string | null) => {
    closeSheet();
    send({ type: 'setLocation', location: { cc: code, city, isp: ui.isp } });
  };
  const rows = cityRows(model, code, geo, query, pickCity);
  return (
    <SheetCommand
      query={ui.query}
      onQuery={setQuery}
      placeholder="Search cities"
      hint={geo.cities.length + ' cities'}
      empty={rows.length === 0 && !!query}
    >
      {query ? null : (
        <>
          <div className={cn(SECTION, 'pt-0.5')}>ISP / ASN</div>
          <IspChips
            value={ui.isp}
            ispLabel={`${geo.isp} · ${geo.asn}`}
            onChange={(isp: IspChoice) => setUi({ isp })}
          />
          <div className={cn(SECTION, 'pt-1.5')}>City</div>
        </>
      )}
      {rows.map((row) => (
        <SheetRow key={row.key} row={row} />
      ))}
    </SheetCommand>
  );
}
