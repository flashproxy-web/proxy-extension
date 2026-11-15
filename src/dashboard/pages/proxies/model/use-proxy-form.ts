import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';

import { useDashboard } from '@/dashboard/shared/model';
import { call } from '@/shared/api/client';
import type { OwnProxy } from '@/shared/model';

import { autoProvider, formDefaults, proxyFormSchema, type ProxyForm } from './proxy-form';

export function useProxyForm(editing: OwnProxy | undefined, providerId: string | null) {
  const form = useForm<ProxyForm>({
    resolver: zodResolver(proxyFormSchema),
    defaultValues: formDefaults(editing, providerId),
  });

  // Credentials stay in the vault; fetch them only for editing.
  useEffect(() => {
    if (!editing?.hasAuth) return;
    void call('getCredentials', editing.id).then((credentials) => {
      if (!credentials) return;
      form.setValue('username', credentials.username);
      form.setValue('password', credentials.password);
    });
  }, [editing?.id, editing?.hasAuth, form]);

  return form;
}

export function useApplyDetectedProvider() {
  const { snapshot } = useDashboard();
  const form = useFormContext<ProxyForm>();

  return (host: string) => {
    const provider = autoProvider(host, form.getValues('manual'), snapshot.providers);
    if (provider !== undefined) form.setValue('provider', provider);
  };
}
