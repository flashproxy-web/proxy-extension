import { ArrowUpRight, ShieldCheck, X } from 'lucide-react';

import { favicon } from '@/dashboard/shared/lib/favicon';
import { ToneBadge } from '@/dashboard/shared/ui/ToneBadge';
import type { SiteRule } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function SiteRuleRow({
  domain,
  kind,
  onRemove,
}: {
  domain: string;
  kind: SiteRule;
  onRemove: () => void;
}) {
  const icon = favicon(domain);
  const proxied = kind === 'proxy';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="bg-fp-panel text-fp-muted flex size-4.5 shrink-0 items-center justify-center overflow-hidden rounded-sm text-xs font-bold">
        {icon ? <img src={icon} alt="" className="size-4" /> : domain[0].toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{domain}</span>
      <ToneBadge tone={proxied ? 'soft' : 'muted'} className="h-6 gap-1.5 px-2.5">
        {proxied ? <ShieldCheck /> : <ArrowUpRight />}
        {proxied ? 'Always proxy' : 'Always direct'}
      </ToneBadge>
      <TooltipHint label="Remove">
        <Button
          variant="ghost"
          size="icon"
          className="text-fp-muted size-7"
          aria-label={`Remove ${domain}`}
          onClick={onRemove}
        >
          <X className="size-3.5" />
        </Button>
      </TooltipHint>
    </div>
  );
}
