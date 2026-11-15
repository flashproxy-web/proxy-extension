import { Check, Star } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { CommandItem } from '@/shared/ui/command';
import { FlagTile } from '@/shared/ui/FlagTile';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { COLOR, SHEET_ROW } from '../config';

import { DynamicIcon } from './DynamicIcon';

import type { MouseEvent } from 'react';

type RowLead = { flag: string | null } | { icon: string; background: string; color: string };

export interface RowSpec {
  key: string;
  title: string;
  subtitle: string;
  lead: RowLead;
  trailing?: string;
  trailingColor?: string;
  selected?: boolean;
  /** Check mark on the selected row (Simple's Connect via). */
  check?: boolean;
  run: () => void;
  star?: { active: boolean; toggle: () => void };
}

function RowLeadTile({ lead }: { lead: RowLead }) {
  if ('flag' in lead) return <FlagTile cc={lead.flag} />;
  return (
    <span
      className="flex size-7 flex-none items-center justify-center rounded-sm"
      style={{ background: lead.background }}
    >
      <DynamicIcon name={lead.icon} className="size-3.5!" style={{ color: lead.color }} />
    </span>
  );
}

function RowItem({ row, className }: { row: RowSpec; className?: string }) {
  return (
    <CommandItem value={row.key} onSelect={row.run} className={cn('row', SHEET_ROW, className)}>
      <RowLeadTile lead={row.lead} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{row.title}</span>
        <span className="text-fp-muted2 block truncate text-xs">{row.subtitle}</span>
      </span>
      {row.trailing ? (
        <span
          className="flex-none font-mono text-xs"
          style={{ color: row.trailingColor ?? COLOR.muted2 }}
        >
          {row.trailing}
        </span>
      ) : null}
      {row.check ? <Check className="text-accent size-3.75! flex-none" /> : null}
    </CommandItem>
  );
}

function StarButton({ active, toggle }: { active: boolean; toggle: () => void }) {
  const label = active ? 'Remove from Favourites' : 'Add to Favourites';
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    toggle();
  };
  return (
    <TooltipHint label={label}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'hover:bg-card! mr-1 size-7.5 hover:scale-110',
          active ? 'text-fp-amber' : 'text-fp-muted2'
        )}
        aria-label={label}
        aria-pressed={active}
        onClick={handleClick}
      >
        <Star className="size-4!" fill={active ? 'currentColor' : 'none'} />
      </Button>
    </TooltipHint>
  );
}

export function SheetRow({ row }: { row: RowSpec }) {
  if (!row.star) return <RowItem row={row} className={cn(row.selected && 'bg-fp-soft')} />;
  return (
    <div
      className={cn(
        'hover:bg-fp-panel has-[[data-selected=true]]:bg-fp-panel flex items-center gap-0.5 rounded-sm',
        row.selected && 'bg-fp-soft'
      )}
    >
      <RowItem row={row} className="min-w-0 flex-1 data-[selected=true]:bg-transparent" />
      <StarButton active={row.star.active} toggle={row.star.toggle} />
    </div>
  );
}
