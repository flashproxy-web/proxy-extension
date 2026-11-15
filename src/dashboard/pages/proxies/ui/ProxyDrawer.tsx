// Add / Edit proxy drawer: single proxy or a pool of endpoints, provider auto-detect,
// SOCKS login warning, tags, and "Test before saving".

import { useWatch } from 'react-hook-form';

import { useDashboard } from '@/dashboard/shared/model';
import { Form } from '@/shared/ui/form';
import { Sheet, SheetContent } from '@/shared/ui/sheet';

import { useDraftTest } from '../model/draft-test';
import { isValidProxy, proxyTarget, type ProxyForm } from '../model/proxy-form';
import { notifyInvalidProxy, saveProxy } from '../model/save-proxy';
import { useProxyForm } from '../model/use-proxy-form';

import { ProxyCredentialFields } from './ProxyCredentialFields';
import { ProxyDrawerFooter, ProxyDrawerHeader } from './ProxyDrawerChrome';
import { PoolEndpointFields, SingleEndpointFields } from './ProxyEndpointFields';
import { KindField, LabelField, ProtocolField, TagsField } from './ProxyFormFields';
import { ProxyProviderField } from './ProxyProviderField';
import { TestStatus } from './TestStatus';

export type DrawerSpec = { mode: 'add'; providerId: string | null } | { mode: 'edit'; id: string };

export function ProxyDrawer({
  drawer,
  onClose,
  onSaved,
}: {
  drawer: DrawerSpec;
  onClose: () => void;
  onSaved: (id: string, pool: boolean) => void;
}) {
  const { lookup } = useDashboard();
  const editing = drawer.mode === 'edit' ? lookup.proxies.get(drawer.id) : undefined;
  const form = useProxyForm(editing, drawer.mode === 'add' ? drawer.providerId : null);
  const values = useWatch({ control: form.control }) as ProxyForm;
  const draftTest = useDraftTest(values);
  const title = editing ? 'Edit proxy' : 'Add proxy';

  const save = async (submitted: ProxyForm) => {
    const saved = await saveProxy(editing, submitted, lookup.providers);
    if (!saved) return;
    onSaved(saved.id, saved.endpoints.length > 1);
    onClose();
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showClose={false}
        aria-label={title}
        className="border-fp-line bg-background w-full gap-0 p-0 sm:max-w-md"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(save, notifyInvalidProxy)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ProxyDrawerHeader title={title} onClose={onClose} />
            <div className="flex flex-1 flex-col gap-4.5 overflow-y-auto p-5">
              <LabelField />
              <KindField />
              {values.kind === 'single' ? (
                <SingleEndpointFields autoFocus={!editing} />
              ) : (
                <PoolEndpointFields />
              )}
              <ProxyProviderField />
              <ProtocolField />
              <ProxyCredentialFields />
              <TagsField />
              {draftTest.test ? (
                <TestStatus test={draftTest.test} host={proxyTarget(values).host} />
              ) : null}
            </div>
            <ProxyDrawerFooter
              testing={draftTest.test?.status === 'run'}
              onTest={() => void draftTest.run()}
              onCancel={onClose}
              submitLabel={
                editing ? 'Save changes' : values.kind === 'pool' ? 'Save pool' : 'Save proxy'
              }
              dimmed={!isValidProxy(values)}
              submitting={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
