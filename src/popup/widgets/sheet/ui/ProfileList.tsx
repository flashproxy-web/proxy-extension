import { usePopup } from '@/popup/entities/connection';
import { COLOR, TONE_COLOR } from '@/popup/shared/config';
import { SheetCommand } from '@/popup/shared/ui/SheetCommand';
import { SheetRow, type RowSpec } from '@/popup/shared/ui/SheetRow';
import { DASH_ROUTE } from '@/shared/config';
import { Button } from '@/shared/ui/button';

import { profiles } from '../model/profiles';

export function ProfileList() {
  const { model, ui, setQuery, closeSheet, openDash } = usePopup();
  const rows: RowSpec[] = profiles(model).map((profile) => ({
    key: profile.id,
    title: profile.name,
    subtitle: profile.subtitle,
    lead: {
      icon: profile.active ? 'check' : 'circle',
      background: COLOR.panel,
      color: profile.active ? COLOR.accent : TONE_COLOR[profile.tone],
    },
    trailing: profile.latency,
    trailingColor: profile.latencyColor,
    selected: profile.active,
    run: () => {
      closeSheet();
      profile.pick();
    },
  }));
  return (
    <SheetCommand query={ui.query} onQuery={setQuery} empty={false}>
      {rows.map((row) => (
        <SheetRow key={row.key} row={row} />
      ))}
      <Button
        variant="outline"
        className="text-fp-muted! mt-1.5 h-9 w-full border-dashed text-xs"
        onClick={() => openDash(DASH_ROUTE.proxies)}
      >
        Manage profiles, pools and rules in the dashboard ↗
      </Button>
    </SheetCommand>
  );
}
