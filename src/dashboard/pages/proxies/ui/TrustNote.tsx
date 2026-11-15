import { ShieldCheck } from 'lucide-react';

export function TrustNote() {
  return (
    <div className="border-fp-soft-line bg-fp-soft mb-4 flex flex-wrap items-center gap-3.5 rounded-xl border px-4 py-3.5">
      <span className="bg-card flex size-8.5 shrink-0 items-center justify-center rounded-lg">
        <ShieldCheck className="text-accent size-4" />
      </span>
      <div className="min-w-0 flex-[1_1_300px]">
        <div className="text-sm font-semibold">
          Your proxies and credentials are stored encrypted on this device and never sent to
          FlashProxy.
        </div>
      </div>
    </div>
  );
}
