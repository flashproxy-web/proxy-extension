import { PLAN_ICON, planLeftLabel } from '@/popup/entities/connection';
import { DynamicIcon } from '@/popup/shared/ui/DynamicIcon';
import { cn } from '@/shared/lib/utils';
import type { Plan, SignIn } from '@/shared/model';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

function LoadingPlanRow({ plan, loaded }: { plan: Plan; loaded: boolean }) {
  return (
    <div className="flex h-10 items-center gap-2.5 px-3.5">
      <span className="bg-fp-soft flex size-6.5 flex-none items-center justify-center rounded-sm">
        <DynamicIcon name={PLAN_ICON[plan.kind]} className="text-accent size-3.25" />
      </span>
      <span className={cn('flex-1 text-sm font-semibold', loaded ? 'opacity-100' : 'opacity-45')}>
        {plan.name}
      </span>
      {loaded ? (
        <span className="text-fp-muted2 text-xs">
          {plan.status === 'expired' ? 'Expired' : planLeftLabel(plan)}
        </span>
      ) : (
        <Skeleton className="bg-fp-line h-2 w-16 rounded-full" />
      )}
    </div>
  );
}

export function SignInPlans({ signIn }: { signIn: SignIn }) {
  return (
    <>
      <Card className="gap-0 py-1.5">
        {signIn.plans.map((plan, index) => (
          <LoadingPlanRow key={plan.id} plan={plan} loaded={index < signIn.step} />
        ))}
      </Card>
      {signIn.email ? (
        <div className="text-fp-muted2 text-center text-xs">Signed in as {signIn.email}</div>
      ) : null}
    </>
  );
}
