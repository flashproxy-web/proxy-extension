import { useFormContext, useWatch } from 'react-hook-form';

import { useDashboard } from '@/dashboard/shared/model';
import { LabelRow } from '@/dashboard/shared/ui/LabelRow';
import { detectProvider } from '@/shared/lib/ownProxies';
import { FormField, FormItem } from '@/shared/ui/form';

import { newProviderName, proxyTarget, type ProxyForm } from '../model/proxy-form';

import { DetectedHint } from './DetectedHint';
import { ProviderPicker } from './ProviderPicker';

export function ProxyProviderField() {
  const { snapshot } = useDashboard();
  const form = useFormContext<ProxyForm>();
  const [kind, endpoints, host, port, provider, manual] = useWatch({
    control: form.control,
    name: ['kind', 'endpoints', 'host', 'port', 'provider', 'manual'],
  });
  const newProvider = newProviderName(provider);
  const detected = detectProvider(proxyTarget({ kind, endpoints, host, port }).host);

  return (
    <FormField
      control={form.control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <LabelRow
            label="Provider"
            hint={detected && !manual ? <DetectedHint isNew={!!newProvider} /> : null}
          />
          <ProviderPicker
            providers={snapshot.providers}
            value={field.value}
            newProvider={newProvider}
            detectedColor={detected?.color}
            onPick={(id) => {
              field.onChange(id);
              form.setValue('manual', true);
            }}
          />
        </FormItem>
      )}
    />
  );
}
