import { usePopup } from '@/popup/entities/connection';
import { SheetCommand } from '@/popup/shared/ui/SheetCommand';
import { SheetRow } from '@/popup/shared/ui/SheetRow';

import { commandRows } from '../model/commands';

export function CommandPalette() {
  const { model, ui, setQuery, closeSheet, openDash } = usePopup();
  const rows = commandRows(model, ui.query, { closeSheet, openDash });
  return (
    <SheetCommand
      query={ui.query}
      onQuery={setQuery}
      placeholder="Type a country, “rotate”, “direct” or a profile"
      hint="↵ to run"
      empty={rows.length === 0 && !!ui.query.trim()}
    >
      {rows.map((row) => (
        <SheetRow key={row.key} row={row} />
      ))}
    </SheetCommand>
  );
}
