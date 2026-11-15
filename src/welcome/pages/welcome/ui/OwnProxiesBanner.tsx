import { DASH_ROUTE } from '@/shared/config';

import { OWN_PROXIES_HINT } from '../config';
import { openDashboard } from '../lib/navigation';

import { StepBanner } from './StepBanner';

export function OwnProxiesBanner() {
  return (
    <StepBanner
      message={OWN_PROXIES_HINT}
      action="Add proxies"
      onAction={() => openDashboard(`?${DASH_ROUTE.addProxy}`)}
    />
  );
}
