import { Card } from '@/shared/ui/card';

import { FlowArrow } from './FlowArrow';

import type { RoutingMode } from '../config';

export function RoutingModeCard({ mode }: { mode: RoutingMode }) {
  const { icon: Glyph, title, via, target, text, good } = mode;

  return (
    <Card className="fp-card min-w-0 gap-2.5 p-4 shadow-none">
      <div className="flex items-center gap-2.5">
        <span className="bg-fp-soft flex size-8 flex-none items-center justify-center rounded-sm">
          <Glyph size={16} className="text-accent" />
        </span>
        <span className="text-base font-semibold">{title}</span>
      </div>
      <div className="bg-fp-panel text-fp-muted flex h-7.5 items-center gap-1.5 overflow-hidden rounded-lg px-2.5 font-mono text-xs whitespace-nowrap">
        You <FlowArrow />
        {via ? (
          <>
            <b className="text-accent">{via}</b> <FlowArrow />
          </>
        ) : null}
        {target}
      </div>
      <p className="text-fp-muted text-sm leading-relaxed">{text}</p>
      <div className="text-fp-muted2 mt-auto text-xs">{good}</div>
    </Card>
  );
}
