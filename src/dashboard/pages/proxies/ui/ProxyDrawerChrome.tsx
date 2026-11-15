import { Activity, X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

export function ProxyDrawerHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="border-fp-line bg-card flex h-15.5 shrink-0 items-center gap-2.5 border-b pr-3.5 pl-5">
      <div className="min-w-0 flex-1">
        <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
        <SheetDescription className="text-fp-muted2 mt-px text-xs">
          Stored encrypted on this device
        </SheetDescription>
      </div>
      <TooltipHint label="Close">
        <Button
          type="button"
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

export function ProxyDrawerFooter({
  testing,
  onTest,
  onCancel,
  submitLabel,
  dimmed,
  submitting,
}: {
  testing: boolean;
  onTest: () => void;
  onCancel: () => void;
  submitLabel: string;
  dimmed: boolean;
  submitting: boolean;
}) {
  return (
    <div className="border-fp-line bg-card flex shrink-0 items-center gap-2 border-t px-5 py-3.5">
      <Button type="button" variant="outline" onClick={onTest} disabled={testing}>
        <Activity />
        {testing ? 'Testing…' : 'Test before saving'}
      </Button>
      <span className="flex-1" />
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" className={cn(dimmed && 'opacity-50')} disabled={submitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
