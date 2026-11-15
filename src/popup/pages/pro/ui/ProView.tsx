import { usePopup } from '@/popup/entities/connection';
import { MODES } from '@/popup/shared/config';
import { SegmentedControl } from '@/popup/shared/ui/SegmentedControl';
import { send } from '@/shared/api/client';

import { alertFor } from '../model/alerts';

import { BandwidthMeter } from './BandwidthMeter';
import { ConnectionCard } from './ConnectionCard';
import { ConnectToggle } from './ConnectToggle';
import { HeroStatus } from './HeroStatus';
import { PopupFooter } from './PopupFooter';
import { SiteCard } from './SiteCard';
import { StatusAlert } from './StatusAlert';

export function ProView() {
  const popup = usePopup();
  const { snapshot, model, tab } = popup;
  const statusAlert = alertFor(model, popup);
  const { plan } = model;
  const showBandwidth = !model.isOwn && plan && (plan.gbTotal ?? 0) > 0;
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5 [scrollbar-width:none] *:shrink-0">
        <div className="flex items-center gap-3.5">
          <HeroStatus />
          <ConnectToggle />
        </div>
        <SegmentedControl
          value={snapshot.settings.mode}
          options={MODES}
          onChange={(mode) => send({ type: 'setMode', mode })}
          className="seg modes grid-cols-4"
        />
        {statusAlert ? <StatusAlert spec={statusAlert} /> : null}
        <ConnectionCard />
        {tab ? <SiteCard tab={tab} /> : null}
        {showBandwidth ? <BandwidthMeter plan={plan} /> : null}
      </div>
      <PopupFooter />
    </>
  );
}
