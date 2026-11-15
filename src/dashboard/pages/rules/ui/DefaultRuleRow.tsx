import { ArrowRight, Lock } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { RuleTarget } from '@/shared/model';

import { RuleGrid } from './RuleGrid';
import { TargetBadge } from './TargetBadge';

const DIRECT: RuleTarget = { kind: 'direct' };

export function DefaultRuleRow({ winning }: { winning: boolean }) {
  return (
    <RuleGrid className={cn(winning ? 'bg-fp-soft' : 'bg-fp-panel')}>
      <Lock className="text-fp-muted2 size-3.5" />
      <span />
      <div>
        <div className="text-sm font-semibold">Everything else</div>
        <div className="text-fp-muted2 mt-0.5 text-xs">Always last</div>
      </div>
      <div className="flex items-center gap-2">
        <ArrowRight className="text-fp-muted2 size-3.5" />
        <TargetBadge target={DIRECT} />
        <span className="text-sm font-medium">Direct</span>
      </div>
      <span />
      <span />
    </RuleGrid>
  );
}
