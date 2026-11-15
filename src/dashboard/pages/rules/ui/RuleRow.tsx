import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRight, GripVertical, Trash2 } from 'lucide-react';


import { useDashboard } from '@/dashboard/shared/model';
import { RULE_TYPE_LABEL } from '@/shared/lib/routing';
import { cn } from '@/shared/lib/utils';
import type { Rule } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import { targetLabel } from '../lib/targets';

import { RuleGrid } from './RuleGrid';
import { TargetBadge } from './TargetBadge';

const patternClass = (winning: boolean, enabled: boolean) =>
  winning ? 'text-fp-accent-ink' : enabled ? 'text-fp-ink' : 'text-fp-muted2';

export function RuleRow({
  rule,
  index,
  winning,
  onToggle,
  onDelete,
}: {
  rule: Rule;
  index: number;
  winning: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { lookup } = useDashboard();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  return (
    <RuleGrid
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'bg-card relative',
        winning && 'bg-fp-soft',
        isDragging && 'z-10 opacity-60 shadow-md',
        !rule.enabled && !isDragging && 'opacity-60'
      )}
    >
      <TooltipHint label="Drag to reorder">
        <Button
          ref={setActivatorNodeRef}
          variant="link"
          className="text-fp-muted2 h-auto cursor-grab p-0 active:cursor-grabbing has-[>svg]:px-0"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </Button>
      </TooltipHint>
      <span className="text-fp-muted2 font-mono text-xs">{index + 1}</span>
      <div className="min-w-0">
        <code
          className={cn('block truncate text-sm font-medium', patternClass(winning, rule.enabled))}
        >
          {rule.pattern}
        </code>
        <div className="text-fp-muted2 mt-0.5 text-xs">{RULE_TYPE_LABEL[rule.type]}</div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <ArrowRight className="text-fp-muted2 size-3.5" />
        <TargetBadge target={rule.target} />
        <span className="truncate text-sm font-medium">{targetLabel(rule.target, lookup)}</span>
      </div>
      <Switch
        className="data-[state=unchecked]:bg-fp-line2"
        checked={rule.enabled}
        onCheckedChange={onToggle}
        aria-label={`Rule ${index + 1} on`}
      />
      <TooltipHint label="Delete rule">
        <Button
          variant="ghost"
          size="icon"
          className="text-fp-muted size-7"
          aria-label="Delete rule"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </TooltipHint>
    </RuleGrid>
  );
}
