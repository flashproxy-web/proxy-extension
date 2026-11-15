import { ArrowRight, FlaskConical } from 'lucide-react';

import { Input } from '@/shared/ui/input';

import { TargetBadge } from './TargetBadge';

import type { RuleTestResult } from '../model/rule-test';

export function RuleTester({
  value,
  onChange,
  result,
}: {
  value: string;
  onChange: (value: string) => void;
  result: RuleTestResult;
}) {
  return (
    <div className="bg-fp-panel flex flex-wrap items-center gap-2.5 rounded-t-xl px-3.5 py-2.5">
      <FlaskConical className="text-accent size-4" />
      <Input
        className="h-8.5 min-w-0 flex-[1_1_15rem] font-mono text-xs md:text-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Test a URL, e.g. https://www.amazon.de/"
        spellCheck={false}
        aria-label="Test a URL"
      />
      {result === 'bad' ? (
        <span className="text-fp-red text-sm">Not a URL yet</span>
      ) : result ? (
        <span className="flex min-w-0 items-center gap-2 text-sm whitespace-nowrap">
          <ArrowRight className="text-fp-muted2 size-3" />
          <span className="text-fp-muted">{result.lead}</span>
          <TargetBadge target={result.target} className="size-4" />
          <b className="truncate font-semibold">{result.name}</b>
        </span>
      ) : null}
    </div>
  );
}
