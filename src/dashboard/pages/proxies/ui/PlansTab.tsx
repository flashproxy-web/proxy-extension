import { LoaderCircle, PackageOpen, PlugZap, UserRound } from 'lucide-react';

import { PLANS_TWO_COL_VW } from '@/dashboard/shared/config';
import { useDashboard } from '@/dashboard/shared/model';
import { EmptyCard } from '@/dashboard/shared/ui/EmptyCard';
import { cn } from '@/shared/lib/utils';
import type { Account } from '@/shared/model';
import { ApiKeyForm } from '@/shared/ui/ApiKeyForm';
import { Button } from '@/shared/ui/button';

import { BuyPlanButton } from './BuyPlanButton';
import { PlanCard } from './PlanCard';

export function PlansTab({ onUseOwn }: { onUseOwn: () => void }) {
  const { snapshot } = useDashboard();

  if (!snapshot.account) return <SignedOutPlans onUseOwn={onUseOwn} />;
  if (!snapshot.plans.length) return <NoPlans onUseOwn={onUseOwn} />;
  return <PlanList account={snapshot.account} />;
}

function UseOwnProxiesButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      <PlugZap />
      Use my own proxies
    </Button>
  );
}

function SignedOutPlans({ onUseOwn }: { onUseOwn: () => void }) {
  const loading = useDashboard().snapshot.runtime.signin?.stage === 'load';

  return (
    <EmptyCard
      icon={PackageOpen}
      title="Add your API key to use your FlashProxy plans"
      text="Your plans, locations and rotation show up here once the key is saved. Your own proxies keep working either way."
    >
      <div className="mt-1.5 flex w-full max-w-90 flex-col items-center gap-3">
        {loading ? (
          <Button variant="outline" disabled>
            <LoaderCircle className="text-accent animate-spin" />
            Loading your plans…
          </Button>
        ) : (
          <ApiKeyForm className="w-full text-left" />
        )}
        <UseOwnProxiesButton onClick={onUseOwn} />
      </div>
    </EmptyCard>
  );
}

function NoPlans({ onUseOwn }: { onUseOwn: () => void }) {
  return (
    <EmptyCard
      icon={PackageOpen}
      title="No FlashProxy plans on this account"
      text="Buy a plan to use FlashProxy locations, rotation and sticky sessions here. Your own proxies keep working either way."
    >
      <div className="mt-1.5 flex flex-wrap justify-center gap-2">
        <BuyPlanButton />
        <UseOwnProxiesButton onClick={onUseOwn} />
      </div>
    </EmptyCard>
  );
}

function PlanList({ account }: { account: Account }) {
  const { snapshot, viewportWidth } = useDashboard();
  const { active } = snapshot.settings;
  const activePlanId = active?.kind === 'fp' ? active.planId : null;

  return (
    <>
      <div
        className={cn(
          'grid gap-3',
          viewportWidth >= PLANS_TWO_COL_VW ? 'grid-cols-2' : 'grid-cols-1'
        )}
      >
        {snapshot.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} inUse={activePlanId === plan.id} />
        ))}
      </div>
      <div className="text-fp-muted2 mt-3.5 flex items-center gap-2 text-sm">
        <UserRound className="size-3.5" />
        Connected as {account.email} · Pick which plan the popup uses from its plan menu.
      </div>
    </>
  );
}
