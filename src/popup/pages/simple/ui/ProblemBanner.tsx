import { ALERT_TONE } from '@/popup/shared/config';
import { DynamicIcon } from '@/popup/shared/ui/DynamicIcon';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

import type { SimpleProblem } from '../model/simple';

export function ProblemBanner({ problem }: { problem: SimpleProblem }) {
  const tone = ALERT_TONE[problem.tone];
  return (
    <div
      className={cn(
        'animate-in fade-in-0 flex flex-none items-center gap-2.5 rounded-md border py-2.5 pr-2.5 pl-3 duration-200',
        tone.box
      )}
    >
      <DynamicIcon name={problem.icon} className="size-4" style={{ color: tone.color }} />
      <span className="s-problem min-w-0 flex-1 text-left text-[13px] leading-snug font-medium text-pretty">
        {problem.text}
      </span>
      <Button className="h-7.5 flex-none px-3 text-[12.5px] font-semibold!" onClick={problem.run}>
        {problem.label}
      </Button>
    </div>
  );
}
