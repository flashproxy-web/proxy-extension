import { useRef, useState } from 'react';

import { call } from '@/shared/api/client';
import type { Provider } from '@/shared/model';
import { Input } from '@/shared/ui/input';

import type { KeyboardEvent } from 'react';

export function ProviderNameInput({
  provider,
  onDone,
}: {
  provider: Provider;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(provider.name);
  const finished = useRef(false);

  const finish = (save: boolean) => {
    if (finished.current) return;
    finished.current = true;
    if (save && draft.trim()) void call('renameProvider', provider.id, draft);
    onDone();
  };
  const handleKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') finish(true);
    if (event.key === 'Escape') finish(false);
  };

  return (
    <Input
      className="h-8 w-56 text-sm font-semibold"
      autoFocus
      aria-label="Provider name"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={handleKey}
    />
  );
}
