import { Check, Copy } from 'lucide-react';

import { HeroDot, usePopup } from '@/popup/entities/connection';
import { EYEBROW } from '@/popup/shared/config';
import { useClipboardCopy } from '@/popup/shared/lib/use-clipboard-copy';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { FlagTile } from '@/shared/ui/FlagTile';

import {
  simpleNote,
  simpleStatus,
  type SimpleDestination,
  type SimpleProblem,
} from '../model/simple';

function CopyIpButton({ ip }: { ip: string }) {
  const { model } = usePopup();
  const { copied, copy } = useClipboardCopy();
  return (
    <Button
      variant="ghost"
      title="Copy IP"
      onClick={() => copy(ip)}
      className={cn(
        's-ip text-fp-muted2 hover:bg-fp-panel hover:text-foreground mt-1.5 h-6 gap-1.5 px-2 font-normal',
        model.rotating && 'opacity-25'
      )}
    >
      <span className="font-mono text-[12.5px]">IP {ip}</span>
      {copied ? <Check className="text-fp-green size-3!" /> : <Copy className="size-3!" />}
    </Button>
  );
}

function ExitDetail({ problem }: { problem: SimpleProblem | undefined }) {
  const { snapshot, model } = usePopup();
  const ip = model.on || model.rotating ? (snapshot.runtime.exit?.ip ?? null) : null;
  if (ip) return <CopyIpButton ip={ip} />;
  const note = simpleNote(model, problem);
  return note ? <div className="s-note text-fp-muted2 mt-1.5 text-[12.5px]">{note}</div> : null;
}

export function ConnectionSummary({
  problem,
  destination,
}: {
  problem: SimpleProblem | undefined;
  destination: SimpleDestination;
}) {
  const { model } = usePopup();
  const status = simpleStatus(model, problem);
  return (
    <div className="w-full min-w-0">
      <div
        className={cn('s-status flex items-center justify-center gap-1.75', EYEBROW)}
        style={{ color: status.color }}
      >
        <HeroDot tone={status.tone} animation={status.animation} />
        {status.label}
      </div>
      <div className="mt-2 flex min-w-0 items-center justify-center gap-2.25">
        <FlagTile cc={destination.flagCc} className="h-4.25 w-6 rounded-xs" />
        <span className="s-title min-w-0 truncate text-[19px] font-bold tracking-tight">
          {destination.title}
        </span>
      </div>
      <ExitDetail problem={problem} />
    </div>
  );
}
