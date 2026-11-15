import { CircleAlert } from 'lucide-react';

import { AUTO_TEST_DELAY_MS } from '@/dashboard/shared/config';
import { notify } from '@/dashboard/shared/lib/notify';
import { call } from '@/shared/api/client';
import { CUSTOM_PROVIDER } from '@/shared/config';
import { detectProvider } from '@/shared/lib/ownProxies';
import type { OwnProxy, Provider } from '@/shared/model';

import {
  firstFormError,
  newProviderName,
  proxyTarget,
  toDraft,
  type ProxyForm,
} from './proxy-form';

import type { FieldErrors } from 'react-hook-form';

const groupName = (saved: OwnProxy, values: ProxyForm, providers: ReadonlyMap<string, Provider>) =>
  providers.get(saved.providerId)?.name ??
  newProviderName(values.provider) ??
  detectProvider(proxyTarget(values).host)?.name ??
  CUSTOM_PROVIDER.name;

export async function saveProxy(
  editing: OwnProxy | undefined,
  values: ProxyForm,
  providers: ReadonlyMap<string, Provider>
): Promise<OwnProxy | null> {
  try {
    const draft = toDraft(values);
    const saved = editing
      ? await call('updateProxy', editing.id, draft)
      : await call('addProxy', draft);
    notify({
      text: editing
        ? 'Saved ' + saved.label
        : `Added ${saved.label} to ${groupName(saved, values, providers)}`,
    });
    if (!editing) setTimeout(() => void call('testProxy', saved.id), AUTO_TEST_DELAY_MS);
    return saved;
  } catch (error) {
    notify({ text: (error as Error).message, icon: CircleAlert, tone: 'warning' });
    return null;
  }
}

export const notifyInvalidProxy = (errors: FieldErrors<ProxyForm>) =>
  notify({ text: firstFormError(errors) ?? '', icon: CircleAlert, tone: 'warning' });
