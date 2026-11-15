import { useFormContext, useWatch } from 'react-hook-form';

import { Hint } from '@/dashboard/shared/ui/Hint';
import { LabelRow } from '@/dashboard/shared/ui/LabelRow';
import { PasswordInput } from '@/dashboard/shared/ui/PasswordInput';
import type { Protocol } from '@/shared/model';
import { FormControl, FormField, FormItem } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

import { SocksWarning } from './SocksWarning';

import type { ProxyForm } from '../model/proxy-form';

const SOCKS_PROTOCOLS = new Set<Protocol>(['SOCKS4', 'SOCKS5']);

export function ProxyCredentialFields() {
  const form = useFormContext<ProxyForm>();
  const [protocol, username, password] = useWatch({
    control: form.control,
    name: ['protocol', 'username', 'password'],
  });

  const clearCredentials = () => {
    form.setValue('username', '');
    form.setValue('password', '');
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <LabelRow label="Username" hint={<Hint>Optional</Hint>} />
              <FormControl>
                <Input className="font-mono" autoComplete="off" spellCheck={false} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <LabelRow label="Password" />
              <FormControl>
                <PasswordInput className="font-mono" autoComplete="new-password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      {SOCKS_PROTOCOLS.has(protocol) && (username || password) ? (
        <SocksWarning protocol={protocol} onRemove={clearCredentials} />
      ) : null}
    </>
  );
}
