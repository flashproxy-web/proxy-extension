import { useFormContext, useWatch } from 'react-hook-form';

import { STRATEGIES, STRATEGY_TEXT } from '@/dashboard/shared/config';
import { Hint } from '@/dashboard/shared/ui/Hint';
import { LabelRow } from '@/dashboard/shared/ui/LabelRow';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { PORT_DIGITS } from '@/shared/config';
import { FormControl, FormField, FormItem } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

import { parseEndpoints, splitHostPort, type ProxyForm } from '../model/proxy-form';
import { useApplyDetectedProvider } from '../model/use-proxy-form';

export function SingleEndpointFields({ autoFocus }: { autoFocus: boolean }) {
  const form = useFormContext<ProxyForm>();
  const applyDetectedProvider = useApplyDetectedProvider();

  const changeHost = (raw: string) => {
    const { host, port } = splitHostPort(raw);
    if (port !== null) form.setValue('port', port);
    form.setValue('host', host);
    applyDetectedProvider(host);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2.5">
      <FormField
        control={form.control}
        name="host"
        render={({ field }) => (
          <FormItem>
            <LabelRow label="Host" />
            <FormControl>
              <Input
                className="font-mono"
                placeholder="brd.superproxy.io"
                spellCheck={false}
                autoFocus={autoFocus}
                {...field}
                onChange={(event) => changeHost(event.target.value)}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="port"
        render={({ field }) => (
          <FormItem>
            <LabelRow label="Port" />
            <FormControl>
              <Input
                className="font-mono"
                placeholder="22225"
                inputMode="numeric"
                {...field}
                onChange={(event) =>
                  field.onChange(event.target.value.replace(/\D/g, '').slice(0, PORT_DIGITS))
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function endpointHint(text: string): string {
  const endpoints = parseEndpoints(text);
  if (!endpoints.length) return 'At least two';
  const valid = endpoints.filter(Boolean).length;
  const invalid = endpoints.length - valid;
  return `${valid} valid` + (invalid > 0 ? ` · ${invalid} with errors` : '');
}

export function PoolEndpointFields() {
  const form = useFormContext<ProxyForm>();
  const endpoints = useWatch({ control: form.control, name: 'endpoints' });
  const applyDetectedProvider = useApplyDetectedProvider();

  const changeEndpoints = (text: string) => {
    form.setValue('endpoints', text);
    const first = parseEndpoints(text).find(Boolean);
    if (first) applyDetectedProvider(first.host);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="endpoints"
        render={({ field }) => (
          <FormItem>
            <LabelRow label="Endpoints" hint={<Hint>{endpointHint(endpoints)}</Hint>} />
            <FormControl>
              <Textarea
                className="[field-sizing:fixed] h-30 font-mono"
                spellCheck={false}
                placeholder="One host:port per line"
                {...field}
                onChange={(event) => changeEndpoints(event.target.value)}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="strategy"
        render={({ field }) => (
          <FormItem>
            <LabelRow label="Pick an endpoint by" />
            <SegmentedControl
              fullWidth
              options={STRATEGIES}
              value={field.value}
              onValueChange={field.onChange}
            />
            <div className="text-fp-muted2 text-xs">{STRATEGY_TEXT[field.value]}</div>
          </FormItem>
        )}
      />
    </>
  );
}
