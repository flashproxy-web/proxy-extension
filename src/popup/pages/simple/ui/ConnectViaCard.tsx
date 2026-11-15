import { ChevronDown, Globe } from 'lucide-react';

import { usePopup, type ActiveTab } from '@/popup/entities/connection';
import { send } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { FlagTile } from '@/shared/ui/FlagTile';
import { Switch } from '@/shared/ui/switch';

import { siteSwitch, type SimpleDestination } from '../model/simple';

function ConnectViaRow({ destination }: { destination: SimpleDestination }) {
  const { openVia } = usePopup();
  return (
    <Button
      variant="ghost"
      onClick={openVia}
      className="s-via border-fp-line hover:bg-fp-panel hover:text-foreground dark:hover:bg-fp-panel h-auto w-full cursor-pointer justify-start gap-2.75 rounded-t-xl rounded-b-none border-b py-2.75 pr-3 pl-3.5 text-left font-normal has-[>svg]:pr-3 has-[>svg]:pl-3.5"
    >
      <FlagTile cc={destination.flagCc} />
      <span className="min-w-0 flex-1">
        <span className="text-fp-muted2 block text-[11.5px]">Connect via</span>
        <span className="mt-px block truncate text-sm font-semibold">{destination.title}</span>
      </span>
      {destination.via ? (
        <span className="text-fp-muted2 max-w-27.5 flex-none truncate text-xs">
          {destination.via}
        </span>
      ) : null}
      <ChevronDown className="text-fp-muted2 size-3.5 flex-none" />
    </Button>
  );
}

function SiteIcon({ site, tab }: { site: string | null; tab: ActiveTab | null }) {
  if (!site) return <Globe className="text-fp-muted2 size-3.75" />;
  if (tab?.favicon) return <img src={tab.favicon} alt="" className="block size-4.5" />;
  return site[0].toUpperCase();
}

function SiteSwitchRow() {
  const { model, tab } = usePopup();
  const { site, on, subtitle, next } = siteSwitch(model, tab);
  const toggle = () => {
    if (site) send({ type: 'setSiteRule', domain: site, rule: next });
  };
  return (
    <div className={cn('flex items-center gap-2.75 py-2.75 pr-3 pl-3.5', !site && 'opacity-60')}>
      <span className="bg-fp-panel text-fp-muted flex size-7 flex-none items-center justify-center overflow-hidden rounded-md text-sm font-bold">
        <SiteIcon site={site} tab={tab} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Use proxy on this site</span>
        <span className="text-fp-muted2 mt-px block truncate text-xs">{subtitle}</span>
      </span>
      <Switch
        className="s-site-switch"
        checked={on}
        disabled={!site}
        aria-label={site ? `Use proxy on ${site}` : 'Use proxy on this site'}
        onCheckedChange={toggle}
      />
    </div>
  );
}

export function ConnectViaCard({ destination }: { destination: SimpleDestination }) {
  return (
    <Card className="flex-none gap-0 py-0 shadow-none">
      <ConnectViaRow destination={destination} />
      <SiteSwitchRow />
    </Card>
  );
}
