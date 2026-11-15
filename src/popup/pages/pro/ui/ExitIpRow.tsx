import { Check, Copy } from 'lucide-react';

import { useClipboardCopy } from '@/popup/shared/lib/use-clipboard-copy';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export function ExitIpRow({ ip, dimClass }: { ip: string | null; dimClass: string }) {
  const { copied, copy } = useClipboardCopy();
  const CopyIcon = copied ? Check : Copy;
  return (
    <div className="flex items-center gap-2">
      <span className="text-fp-muted2 w-13 flex-none text-xs">Exit IP</span>
      <span
        className={cn(
          'ip min-w-0 flex-1 font-mono text-base font-semibold tracking-tight transition-opacity duration-300',
          dimClass
        )}
      >
        {ip ?? '—'}
      </span>
      <Button
        variant="outline"
        className={cn(
          'h-6.5 gap-1.25 px-2 text-xs font-semibold!',
          copied ? 'text-fp-green!' : 'text-fp-muted!'
        )}
        title="Copy IP"
        onClick={() => copy(ip)}
      >
        <CopyIcon className="size-3!" />
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
