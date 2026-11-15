import { ChevronDown } from 'lucide-react';

import { PLAN_ICON, planChipLabel, usePopup, type Model } from '@/popup/entities/connection';
import { BRAND_GRADIENT } from '@/popup/shared/config';
import { DynamicIcon } from '@/popup/shared/ui/DynamicIcon';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

import type { ComponentProps } from 'react';

function sourceLabel(model: Model): string {
  if (model.isOwn) return `${model.providerName} · ${model.proxy?.label ?? ''}`;
  if (model.status === 'noplans' || !model.plan) return 'No active plans';
  return planChipLabel(model.plan);
}

function SourceBadge({ model }: { model: Model }) {
  if (model.isOwn) {
    return (
      <span
        className="flex size-4.5 flex-none items-center justify-center rounded text-xs font-bold text-white"
        style={{ background: model.provider?.color }}
      >
        {model.provider?.initial ?? 'C'}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'flex size-4.5 flex-none items-center justify-center rounded text-xs font-bold text-white',
        BRAND_GRADIENT
      )}
    >
      <DynamicIcon
        name={model.plan ? PLAN_ICON[model.plan.kind] : 'house'}
        className="size-2.75!"
      />
    </span>
  );
}

export function SourceChip(props: ComponentProps<typeof Button>) {
  const { model } = usePopup();
  return (
    <Button
      variant="outline"
      className="src-chip h-7 max-w-32 min-w-0 shrink justify-start gap-1.5 overflow-hidden rounded-full! pr-2 pl-1.25 text-xs font-semibold!"
      title="Switch plan or proxy source"
      {...props}
    >
      <SourceBadge model={model} />
      <span className="min-w-0 truncate">{sourceLabel(model)}</span>
      <ChevronDown className="text-fp-muted2 size-2.75!" />
    </Button>
  );
}
