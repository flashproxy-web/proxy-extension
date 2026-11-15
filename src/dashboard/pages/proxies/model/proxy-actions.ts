import { Check, CircleAlert, CircleX, Pause, Trash2, TriangleAlert } from 'lucide-react';

import { plural } from '@/dashboard/shared/lib/format';
import { notify } from '@/dashboard/shared/lib/notify';
import { call } from '@/shared/api/client';
import type { OwnProxy, Provider } from '@/shared/model';

export async function testProxy(proxy: OwnProxy) {
  const result = await call('testProxy', proxy.id);
  if (!result.ok) notify({ text: proxy.label + ' did not answer', icon: CircleX, tone: 'error' });
}

export async function testAllProxies(running: boolean, count: number) {
  if (running) {
    await call('stopTesting');
    return;
  }
  if (!count) return notify({ text: 'Add a proxy first', icon: CircleAlert, tone: 'warning' });
  const summary = await call('testAll');
  if (summary.stopped) return notify({ text: 'Test stopped', icon: Pause, tone: 'info' });
  notify({
    text: `Tested ${plural(summary.total, 'proxy', 'proxies')} · ${summary.healthy} healthy${summary.failing ? `, ${summary.failing} failing` : ''}`,
    icon: summary.failing ? TriangleAlert : Check,
    tone: summary.failing ? 'warning' : 'success',
  });
}

export async function duplicateProxy(proxy: OwnProxy) {
  await call('duplicateProxy', proxy.id);
  notify({ text: 'Duplicated ' + proxy.label });
}

export async function moveProxy(proxy: OwnProxy, provider: Provider) {
  await call('moveProxy', proxy.id, provider.id);
  notify({ text: `Moved ${proxy.label} to ${provider.name}` });
}

export async function deleteProxy(proxy: OwnProxy) {
  const token = await call('deleteProxy', proxy.id);
  notify({
    text: 'Deleted ' + proxy.label,
    icon: Trash2,
    tone: 'error',
    undo: () => void call('undoDelete', token),
  });
}
