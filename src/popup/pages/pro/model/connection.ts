import type { Model } from '@/popup/entities/connection';
import { COLOR } from '@/popup/shared/config';
import { latencyColor } from '@/shared/lib/format';
import type { StatusTone } from '@/shared/ui/StatusDot';

interface CardLocation {
  cc: string | null;
  title: string;
  subtitle: string;
}

interface ProfileStatus {
  name: string;
  latency: string;
  tone: StatusTone;
  color: string;
}

const PAUSED_STATUSES = new Set(['conflict', 'bw', 'expired']);

export function liveLatency(model: Model): number | null {
  return model.live ? model.snapshot.runtime.latency : null;
}

export function latencyText(latency: number | null | undefined): string {
  return latency != null ? latency + ' ms' : '—';
}

function targetingLabel(model: Model): string {
  const { plan, location, snapshot } = model;
  if (!plan?.cityTargeting) return 'Country-level targeting';
  if (location.isp === 'any') return 'Any ISP';
  if (location.isp === 'mob') return 'Mobile carriers';
  return snapshot.geo[location.cc]?.isp ?? 'Any ISP';
}

export function cardLocation(model: Model): CardLocation {
  if (model.isOwn) {
    return {
      cc: model.exitCc,
      title: model.proxy?.label ?? '',
      subtitle: `${model.providerName} · ${model.proxy?.protocol ?? ''} · ${model.host}`,
    };
  }
  return {
    cc: model.location.cc,
    title: model.placeTitle,
    subtitle: `${model.plan?.name ?? 'FlashProxy'} · ${targetingLabel(model)}`,
  };
}

export function ispLabel(model: Model): string {
  const { liveExit } = model;
  if (model.isOwn) return `${model.providerName} · exit ${model.exitCountry ?? 'unknown'}`;
  if (liveExit?.isp) return liveExit.isp + (liveExit.asn ? ' · ' + liveExit.asn : '');
  const geo = model.snapshot.geo[model.location.cc];
  return geo ? `${geo.isp} · ${geo.asn}` : '—';
}

export function sessionStat(model: Model): { label: string; value: string; color: string } {
  if (model.isOwn) {
    const failing = model.proxy?.healthy === false;
    return {
      label: 'Health',
      value: failing ? 'Failing' : 'Healthy',
      color: failing ? COLOR.red : COLOR.green,
    };
  }
  const sticky = model.snapshot.settings.session === 'sticky';
  return { label: 'Session', value: sticky ? 'Sticky 10m' : 'Rotating', color: COLOR.foreground };
}

export function profileStatus(model: Model): ProfileStatus {
  const latency = liveLatency(model);
  if (model.isOwn) {
    const down = model.proxy?.healthy === false;
    const ownLatency = latency ?? model.proxy?.latency;
    return {
      name: model.proxy?.label ?? '',
      latency: down ? 'down' : latencyText(ownLatency),
      tone: down ? 'bad' : 'ok',
      color: down ? COLOR.red : latencyColor(ownLatency),
    };
  }
  const paused = PAUSED_STATUSES.has(model.status);
  return {
    name: model.profileName,
    latency: latencyText(latency),
    tone: model.failed ? (paused ? 'warn' : 'bad') : 'ok',
    color: latencyColor(latency),
  };
}
