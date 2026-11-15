import { Search } from 'lucide-react';

import { HEALTH_FILTERS, PROTOCOL_FILTERS } from '@/dashboard/shared/config';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { ProxyFilterState } from '../model/proxy-filter';

export function ProxyFilters({
  filter,
  onChange,
  summary,
  allOpen,
  onToggleAll,
}: {
  filter: ProxyFilterState;
  onChange: (patch: Partial<ProxyFilterState>) => void;
  summary: string;
  allOpen: boolean;
  onToggleAll: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <div className="relative max-w-85 flex-[1_1_12rem]">
        <Search className="text-fp-muted2 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          className="pl-9"
          value={filter.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search label, host or tag"
          aria-label="Search proxies"
        />
      </div>
      <SegmentedControl
        options={PROTOCOL_FILTERS}
        value={filter.protocol}
        onValueChange={(protocol) => onChange({ protocol })}
      />
      <SegmentedControl
        options={HEALTH_FILTERS}
        value={filter.health}
        onValueChange={(health) => onChange({ health })}
      />
      <span className="flex-1" />
      <span className="text-fp-muted2 text-sm whitespace-nowrap">{summary}</span>
      <Button variant="ghost" size="sm" onClick={onToggleAll}>
        {allOpen ? 'Collapse all' : 'Expand all'}
      </Button>
    </div>
  );
}
