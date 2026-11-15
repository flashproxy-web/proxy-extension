import { usePopup } from '@/popup/entities/connection';
import { DynamicIcon } from '@/popup/shared/ui/DynamicIcon';
import { send } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';

import { proOnlySetting } from '../model/simple';

export function ProOnlyChip() {
  const { model } = usePopup();
  const setting = proOnlySetting(model);
  if (!setting) return null;
  return (
    <Button
      variant="outline"
      title="Open Pro to change this"
      onClick={() => send({ type: 'setUi', ui: 'pro' })}
      className="pro-chip border-fp-soft-line bg-fp-soft text-fp-accent-ink hover:border-accent hover:bg-fp-soft hover:text-fp-accent-ink h-6.5 gap-1.5 rounded-full! px-2.5 text-xs font-semibold! shadow-none"
    >
      <DynamicIcon name={setting.icon} className="size-3!" />
      {setting.label}
      <span className="opacity-60">· Pro</span>
    </Button>
  );
}
