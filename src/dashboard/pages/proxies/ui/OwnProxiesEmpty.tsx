import { Lock, PlugZap, Plus, Upload } from 'lucide-react';

import { EmptyCard } from '@/dashboard/shared/ui/EmptyCard';
import { Button } from '@/shared/ui/button';

import { FormatList } from './FormatList';

export function OwnProxiesEmpty({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
  return (
    <EmptyCard
      icon={PlugZap}
      title="Add your first proxy"
      text="Bring proxies from any provider. They're stored encrypted on this device and work in rules next to your FlashProxy plans. Add one, or paste a list."
    >
      <div className="mt-1.5 flex flex-wrap justify-center gap-2">
        <Button onClick={onAdd}>
          <Plus />
          Add proxy
        </Button>
        <Button variant="outline" onClick={onImport}>
          <Upload />
          Import from a list
        </Button>
      </div>
      <FormatList className="mt-2.5 flex flex-wrap justify-center gap-1.5" />
      <div className="text-fp-muted2 mt-2 flex items-center gap-1.5 text-xs">
        <Lock className="size-3" />
        Stored encrypted on this device. Never sent to FlashProxy.
      </div>
    </EmptyCard>
  );
}
