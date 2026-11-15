import { usePopup } from '@/popup/entities/connection';

import { simpleDestination, simpleProblem } from '../model/simple';

import { ConnectionSummary } from './ConnectionSummary';
import { ConnectViaCard } from './ConnectViaCard';
import { NewIpButton } from './NewIpButton';
import { PowerButton } from './PowerButton';
import { ProblemBanner } from './ProblemBanner';
import { ProOnlyChip } from './ProOnlyChip';

export function SimpleView() {
  const { model, openVia } = usePopup();
  const problem = simpleProblem(model, openVia);
  const destination = simpleDestination(model);
  const canRotate = !model.isOwn && model.signedIn && model.status !== 'noplans';
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pt-4 pb-3.5 [scrollbar-width:none]">
      <div className="flex min-h-60 flex-1 flex-col items-center justify-center gap-3.5 text-center">
        <PowerButton problem={problem} />
        <ConnectionSummary problem={problem} destination={destination} />
        <ProOnlyChip />
      </div>
      {problem ? <ProblemBanner problem={problem} /> : null}
      <ConnectViaCard destination={destination} />
      {canRotate ? <NewIpButton /> : null}
    </div>
  );
}
