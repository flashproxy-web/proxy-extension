import { Shuffle } from 'lucide-react';

import {
  countryPool,
  filterCountries,
  firstCity,
  usePopup,
  type Model,
} from '@/popup/entities/connection';
import { SECTION } from '@/popup/shared/config';
import { SheetCommand } from '@/popup/shared/ui/SheetCommand';
import { SheetRow, type RowSpec } from '@/popup/shared/ui/SheetRow';
import { send } from '@/shared/api/client';
import { countryName } from '@/shared/lib/countries';
import type { Location, Plan } from '@/shared/model';
import { Button } from '@/shared/ui/button';

import { FavouriteChips } from './FavouriteChips';

function countrySubtitle(model: Model, plan: Plan, code: string): string {
  const geo = model.snapshot.geo[code];
  if (!plan.cityTargeting) return `${plan.name} · country level`;
  return geo ? `${geo.cities.length} cities · ${geo.isp}` : 'Any city';
}

function randomCity(model: Model, plan: Plan): string | null {
  const cities = model.snapshot.geo[model.location.cc]?.cities ?? [];
  if (!plan.cityTargeting || cities.length === 0) return null;
  return cities[Math.floor(Math.random() * cities.length)];
}

function RandomLocationButton({ plan, onPick }: { plan: Plan; onPick: () => void }) {
  const { model } = usePopup();
  const title = plan.cityTargeting
    ? 'Random in ' + model.country
    : 'Best available in ' + model.country;
  const subtitle = plan.cityTargeting
    ? 'Any city, best available exit'
    : plan.name + ' picks the fastest exit';
  return (
    <Button
      variant="ghost"
      className="h-auto w-full justify-start gap-2.5 p-2 py-2.25 text-left font-normal!"
      onClick={onPick}
    >
      <span className="bg-fp-soft flex size-7 flex-none items-center justify-center rounded-sm">
        <Shuffle className="text-accent size-3.5!" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="text-fp-muted2 block truncate text-xs">{subtitle}</span>
      </span>
    </Button>
  );
}

export function CountryList({ plan }: { plan: Plan }) {
  const { snapshot, model, ui, setUi, setQuery, closeSheet } = usePopup();
  const query = ui.query.trim().toLowerCase();
  const pool = countryPool(snapshot, plan);
  const favourites = new Set(snapshot.settings.favourites);
  const pick = (location: Location) => {
    closeSheet();
    send({ type: 'setLocation', location });
  };
  const drillInto = (code: string) =>
    setUi({ drill: code, query: '', isp: code === model.location.cc ? model.location.isp : 'any' });
  const rows: RowSpec[] = filterCountries(pool, query).map((code) => {
    const drillable = plan.cityTargeting && !!snapshot.geo[code]?.cities.length;
    return {
      key: code,
      title: countryName(code),
      subtitle: countrySubtitle(model, plan, code),
      lead: { flag: code },
      trailing: code.toUpperCase(),
      selected: code === model.location.cc,
      star: {
        active: favourites.has(code),
        toggle: () => send({ type: 'toggleFavourite', cc: code }),
      },
      run: () => (drillable ? drillInto(code) : pick({ cc: code, city: null, isp: 'any' })),
    };
  });
  const pickRandom = () =>
    pick({ cc: model.location.cc, city: randomCity(model, plan), isp: model.location.isp });
  const favouriteCodes = snapshot.settings.favourites.filter(
    (code) => !plan.countries || plan.countries.includes(code)
  );
  const placeholder = plan.countries
    ? `Search ${pool.length} ${plan.name} locations`
    : `Search ${pool.length} countries`;

  return (
    <SheetCommand
      query={ui.query}
      onQuery={setQuery}
      placeholder={placeholder}
      hint="ISO code works"
      empty={rows.length === 0 && !!query}
    >
      {query ? null : (
        <>
          <RandomLocationButton plan={plan} onPick={pickRandom} />
          <div className={SECTION}>Favourites</div>
          <FavouriteChips
            codes={favouriteCodes}
            onPick={(code) => pick({ cc: code, city: firstCity(snapshot, plan, code), isp: 'any' })}
          />
          <div className={SECTION}>All countries</div>
        </>
      )}
      {rows.map((row) => (
        <SheetRow key={row.key} row={row} />
      ))}
    </SheetCommand>
  );
}
