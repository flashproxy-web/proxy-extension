import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { call } from '../api/client';
import { FP_LINKS } from '../config';
import { cn } from '../lib/utils';

import { Button } from './button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';

const schema = z.object({ key: z.string().trim().min(1, 'Paste your API key first') });
type ApiKeyValues = z.infer<typeof schema>;

/** Paste a flashproxy.com API key; the background checks it before saving. */
export function ApiKeyForm({
  className,
  autoFocus = false,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const form = useForm<ApiKeyValues>({ resolver: zodResolver(schema), defaultValues: { key: '' } });
  const busy = form.formState.isSubmitting;

  const submit = form.handleSubmit(async ({ key }) => {
    try {
      await call('setApiKey', key);
      form.reset();
    } catch (error) {
      form.setError('key', { message: error instanceof Error ? error.message : String(error) });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className={cn('flex flex-col gap-2.5', className)}>
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API key</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="fpk_live_…"
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus={autoFocus}
                  disabled={busy}
                  className="font-mono"
                />
              </FormControl>
              <FormDescription>
                Create one in{' '}
                <a
                  href={FP_LINKS.apiKeys}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  Settings → API
                  <ExternalLink className="size-3" aria-hidden />
                </a>{' '}
                with the Proxies permission.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={busy} className="h-10 w-full text-sm font-semibold">
          {busy ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
          {busy ? 'Checking the key…' : 'Save API key'}
        </Button>
      </form>
    </Form>
  );
}
