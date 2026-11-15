import { X } from 'lucide-react';

import type { ImportMode } from '@/dashboard/shared/config';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { DialogDescription, DialogTitle } from '@/shared/ui/dialog';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { batchStatus, importButtonLabel, type ImportBatch } from '../model/import-batch';

export function ImportModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-fp-line bg-card flex shrink-0 items-center gap-2.5 border-b py-4 pr-4 pl-5.5">
      <div className="flex-1">
        <DialogTitle className="text-lg leading-normal font-semibold">Import proxies</DialogTitle>
        <DialogDescription className="text-fp-muted2 mt-0.5 text-sm">
          Paste one proxy per line. Mixed formats are fine.
        </DialogDescription>
      </div>
      <TooltipHint label="Close">
        <Button
          variant="ghost"
          size="icon"
          className="text-fp-muted size-8"
          aria-label="Close"
          onClick={onClose}
        >
          <X />
        </Button>
      </TooltipHint>
    </div>
  );
}

export function ImportModalFooter({
  batch,
  mode,
  onCancel,
  onImport,
}: {
  batch: ImportBatch;
  mode: ImportMode;
  onCancel: () => void;
  onImport: () => void;
}) {
  const count = batch.ready.length;

  return (
    <div className="border-fp-line bg-card flex shrink-0 items-center gap-2 border-t px-5.5 py-3.5">
      <span className="text-fp-muted2 text-sm">{batchStatus(batch)}</span>
      <span className="flex-1" />
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button className={cn(!count && 'opacity-50')} onClick={onImport}>
        {importButtonLabel(mode, count)}
      </Button>
    </div>
  );
}
