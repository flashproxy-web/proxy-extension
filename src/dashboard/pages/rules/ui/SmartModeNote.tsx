import { Info } from 'lucide-react';

export function SmartModeNote() {
  return (
    <div className="border-fp-soft-line bg-fp-soft text-fp-accent-ink mb-3.5 flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-sm">
      <Info className="size-4 shrink-0" />
      <span>
        <b className="font-semibold">Rules only apply in Smart mode.</b> In Global mode every site
        uses your proxy, and in Direct mode none do.
      </span>
    </div>
  );
}
