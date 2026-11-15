import { usePopup, type ActiveTab } from '@/popup/entities/connection';
import { CHIP_ON, SITE_ACTIONS } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { routeFor, siteKey } from '@/shared/lib/routing';
import { cn } from '@/shared/lib/utils';
import type { SiteRule } from '@/shared/model';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

import { siteRuleText } from '../model/site-rule-text';

function SiteIcon({ tab, site }: { tab: ActiveTab; site: string }) {
  return (
    <span className="bg-fp-panel text-fp-muted flex size-5.5 flex-none items-center justify-center overflow-hidden rounded-sm text-xs font-bold">
      {tab.favicon ? (
        <img src={tab.favicon} alt="" className="block size-4" />
      ) : (
        site[0].toUpperCase()
      )}
    </span>
  );
}

function RouteBadge({ proxied }: { proxied: boolean }) {
  return (
    <Badge
      className={cn(
        'h-5 rounded-full border-transparent px-1.75 text-xs font-semibold',
        proxied ? 'bg-fp-soft text-fp-accent-ink' : 'bg-fp-panel text-fp-muted2'
      )}
    >
      {proxied ? 'Proxied' : 'Direct'}
    </Badge>
  );
}

function SiteActions({ site, userRule }: { site: string; userRule: SiteRule | undefined }) {
  const { model, openSheet } = usePopup();
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {SITE_ACTIONS.map(({ rule, label }) => {
        const active = userRule === rule;
        return (
          <Button
            key={rule}
            variant="outline"
            className={cn('h-7 px-1 text-xs', active && CHIP_ON)}
            onClick={() => send({ type: 'setSiteRule', domain: site, rule: active ? null : rule })}
          >
            {label}
          </Button>
        );
      })}
      <Button
        variant="outline"
        className="h-7 px-1 text-xs"
        onClick={() => openSheet(model.isOwn ? 'own' : 'prof')}
      >
        Other profile
      </Button>
    </div>
  );
}

export function SiteCard({ tab }: { tab: ActiveTab }) {
  const { snapshot, model } = usePopup();
  const { settings } = snapshot;
  const site = siteKey(tab.host);
  const userRule = settings.siteRules[site];
  const { proxied, route } = routeFor(
    new URL(tab.url),
    settings.mode,
    settings.siteRules,
    snapshot.rules
  );
  return (
    <Card className="gap-2.25 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <SiteIcon tab={tab} site={site} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{site}</div>
          <div className="text-fp-muted2 truncate text-xs">
            {siteRuleText(model, site, userRule, route)}
          </div>
        </div>
        <RouteBadge proxied={proxied && (model.on || model.rotating)} />
      </div>
      <SiteActions site={site} userRule={userRule} />
    </Card>
  );
}
