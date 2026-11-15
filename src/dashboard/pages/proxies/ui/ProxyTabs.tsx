import { PlugZap, Zap } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

export type ProxyTab = 'own' | 'fp';

const TABS = [
  { id: 'fp', label: 'FlashProxy plans', icon: Zap },
  { id: 'own', label: 'My proxies', icon: PlugZap },
] as const;

export function ProxyTabs({
  tab,
  onChange,
  counts,
}: {
  tab: ProxyTab;
  onChange: (tab: ProxyTab) => void;
  counts: Record<ProxyTab, number>;
}) {
  return (
    <Tabs value={tab} onValueChange={(value) => onChange(value as ProxyTab)} className="mb-5">
      <TabsList className="border-fp-line h-auto w-full justify-start gap-7 rounded-none border-b bg-transparent p-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="text-fp-muted2 data-[state=active]:text-fp-ink dark:text-fp-muted2 h-10.5 flex-none rounded-none border-0 px-0 text-sm font-semibold shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_var(--accent)] dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent"
          >
            <Icon />
            {label}
            <span className="border-fp-line bg-fp-panel text-fp-muted2 inline-flex h-5 min-w-5.5 items-center justify-center rounded-full border px-1.5 text-xs font-semibold">
              {counts[id]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
