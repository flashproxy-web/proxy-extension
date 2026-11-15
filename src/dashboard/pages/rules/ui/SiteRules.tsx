import { MousePointerClick } from 'lucide-react';

import type { SiteRule } from '@/shared/model';
import { Card } from '@/shared/ui/card';

import { SiteRuleRow } from './SiteRuleRow';

export function SiteRules({
  siteRules,
  onRemove,
}: {
  siteRules: Record<string, SiteRule>;
  onRemove: (domain: string) => void;
}) {
  const sites = Object.entries(siteRules);

  return (
    <div className="mt-7">
      <div className="mb-3">
        <div className="text-lg font-semibold tracking-tight">Site rules</div>
        <div className="text-fp-muted mt-1 text-sm">
          Sites you set to Always proxy or Always direct from the popup. These win over the rules
          above.
        </div>
      </div>
      {sites.length > 0 ? (
        <Card className="fp-card divide-fp-line gap-0 divide-y overflow-hidden py-0">
          {sites.map(([domain, kind]) => (
            <SiteRuleRow
              key={domain}
              domain={domain}
              kind={kind}
              onRemove={() => onRemove(domain)}
            />
          ))}
        </Card>
      ) : (
        <NoSiteRules />
      )}
    </div>
  );
}

function NoSiteRules() {
  return (
    <div className="border-fp-line2 text-fp-muted flex items-center gap-3 rounded-xl border-2 border-dashed p-4 text-sm">
      <MousePointerClick className="text-fp-muted2 size-4" />
      <span>
        In the popup, use <b className="text-fp-ink">Always proxy</b> or{' '}
        <b className="text-fp-ink">Always direct</b> on any site to add it here.
      </span>
    </div>
  );
}
