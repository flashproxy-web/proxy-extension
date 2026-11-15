import { SkipForward } from 'lucide-react';

import { usePopup, type Model } from '@/popup/entities/connection';
import { send } from '@/shared/api/client';
import { latencyColor } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { FlagTile } from '@/shared/ui/FlagTile';

import { cardLocation, ispLabel, latencyText, liveLatency, sessionStat } from '../model/connection';

import { ExitIpRow } from './ExitIpRow';
import { MetaStat } from './MetaStat';
import { SessionControls } from './SessionControls';

function exitDimClass(model: Model): string {
  if (model.connecting) return 'opacity-25';
  if (model.rotating) return 'opacity-20';
  return 'opacity-100';
}

function LocationButton() {
  const { model, openSheet } = usePopup();
  const location = cardLocation(model);
  return (
    <Button
      variant="ghost"
      className="border-fp-line h-auto w-full justify-start gap-2.5 rounded-none! border-b px-3.5 py-3 text-left font-normal!"
      onClick={() => openSheet(model.isOwn ? 'own' : 'loc')}
    >
      <FlagTile cc={location.cc} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{location.title}</span>
        <span className="text-fp-muted2 block truncate text-xs">{location.subtitle}</span>
      </span>
      <span className="text-fp-accent-ink flex-none text-xs font-semibold">Change</span>
    </Button>
  );
}

function ConnectionStats() {
  const { model } = usePopup();
  const latency = liveLatency(model);
  const session = sessionStat(model);
  return (
    <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-2.5">
      <MetaStat label={model.isOwn ? 'Provider' : 'ISP / ASN'} className="font-medium">
        {ispLabel(model)}
      </MetaStat>
      <MetaStat label="Latency" className="font-semibold" style={{ color: latencyColor(latency) }}>
        {latencyText(latency)}
      </MetaStat>
      <MetaStat label={session.label} className="font-semibold" style={{ color: session.color }}>
        {session.value}
      </MetaStat>
    </div>
  );
}

function NextProxyButton({ poolIndex, poolSize }: { poolIndex: number; poolSize: number }) {
  return (
    <Button
      variant="outline"
      className="h-8.5 w-full gap-2 text-xs font-semibold!"
      onClick={() => send({ type: 'nextProxy' })}
    >
      <SkipForward className="text-accent size-3.25!" />
      Next proxy in pool
      <span className="text-fp-muted2 font-mono text-xs font-medium">
        {(poolIndex % poolSize) + 1} / {poolSize}
      </span>
    </Button>
  );
}

export function ConnectionCard() {
  const { snapshot, model } = usePopup();
  const exitIp = model.live ? (snapshot.runtime.exit?.ip ?? null) : null;
  const poolSize = model.proxy?.endpoints.length ?? 0;
  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden py-0 transition-opacity duration-300',
        model.live ? 'opacity-100' : 'opacity-50'
      )}
    >
      <LocationButton />
      <div className="flex flex-col gap-2.75 px-3.5 py-3">
        <ExitIpRow ip={exitIp} dimClass={exitDimClass(model)} />
        <ConnectionStats />
        {model.isOwn ? null : <SessionControls />}
        {model.isOwn && poolSize > 1 ? (
          <NextProxyButton poolIndex={snapshot.runtime.poolIdx} poolSize={poolSize} />
        ) : null}
      </div>
    </Card>
  );
}
