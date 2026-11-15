import { ROUTING_MODES } from '../config';

import { RoutingModeCard } from './RoutingModeCard';
import { SectionCard } from './SectionCard';

export function RoutingModes() {
  return (
    <SectionCard
      kicker="Good to know"
      title="Three ways to route traffic"
      aside="Available in Pro, at the top of the popup."
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {ROUTING_MODES.map((mode) => (
          <RoutingModeCard key={mode.id} mode={mode} />
        ))}
      </div>
    </SectionCard>
  );
}
