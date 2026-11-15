import { SLOW_LATENCY_MS } from '@/dashboard/shared/config';
import type { Endpoint, OwnProxy } from '@/shared/model';
import type { StatusTone } from '@/shared/ui/StatusDot';

export function healthTone(proxy: OwnProxy, testing: boolean): StatusTone {
  if (testing) return 'busy';
  if (!proxy.healthy) return 'bad';
  return proxy.latency && proxy.latency > SLOW_LATENCY_MS ? 'warn' : 'ok';
}

export function healthText(proxy: OwnProxy, testing: boolean): string {
  if (testing) return 'Testing…';
  if (!proxy.healthy) return proxy.error ?? 'Timed out';
  return proxy.latency ? proxy.latency + ' ms' : '—';
}

export function endpointLatency(endpoint: Endpoint): { text: string; className: string } {
  if (endpoint.healthy === false) return { text: 'down', className: 'text-fp-red' };
  const latency = endpoint.latency ?? 0;
  return {
    text: endpoint.latency ? endpoint.latency + ' ms' : '—',
    className: latency > SLOW_LATENCY_MS ? 'text-fp-amber' : 'text-fp-ink',
  };
}
