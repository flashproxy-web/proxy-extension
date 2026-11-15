// Bulk import: paste proxies in any format, preview what parsed, import as separate
// proxies or as one pool.

import { useState } from 'react';

import { AUTO_PROVIDER, IMPORT_TWO_COL_VW, type ImportMode } from '@/dashboard/shared/config';
import { useDashboard } from '@/dashboard/shared/model';
import { DEFAULT_POOL_NAME } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { Dialog, DialogContent } from '@/shared/ui/dialog';

import { batchProviderName, importBatch, parseImportText } from '../model/import-batch';

import { BatchProviderField, ImportModeField, PasteField } from './ImportFields';
import { ImportModalFooter, ImportModalHeader } from './ImportModalChrome';
import { ImportPreview } from './ImportPreview';

export function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { lookup, viewportWidth } = useDashboard();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<ImportMode>('separate');
  const [providerId, setProviderId] = useState<string>(AUTO_PROVIDER.id);
  const [poolName, setPoolName] = useState(DEFAULT_POOL_NAME);
  const [busy, setBusy] = useState(false);

  const batch = parseImportText(text);

  const submit = async () => {
    if (!batch.ready.length || busy) return;
    setBusy(true);
    const imported = await importBatch(batch.ready, mode, providerId, poolName);
    setBusy(false);
    if (!imported) return;
    onDone();
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-label="Import proxies"
        className="border-fp-line bg-background flex max-h-[92vh] w-[94vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-5xl"
      >
        <ImportModalHeader onClose={onClose} />
        <div
          className={cn(
            'grid min-h-0 flex-1 items-start gap-5.5 overflow-y-auto px-5.5 py-5',
            viewportWidth >= IMPORT_TWO_COL_VW ? 'grid-cols-[9fr_11fr]' : 'grid-cols-1'
          )}
        >
          <div className="flex min-w-0 flex-col gap-4">
            <PasteField value={text} onChange={setText} />
            <ImportModeField
              mode={mode}
              onModeChange={setMode}
              poolName={poolName}
              onPoolNameChange={setPoolName}
              endpointCount={batch.ready.length}
            />
            <BatchProviderField value={providerId} onChange={setProviderId} />
          </div>
          <ImportPreview
            lines={batch.lines}
            ready={batch.ready.length}
            errors={batch.errors}
            batchProvider={batchProviderName(providerId, lookup.providers)}
          />
        </div>
        <ImportModalFooter
          batch={batch}
          mode={mode}
          onCancel={onClose}
          onImport={() => void submit()}
        />
      </DialogContent>
    </Dialog>
  );
}
