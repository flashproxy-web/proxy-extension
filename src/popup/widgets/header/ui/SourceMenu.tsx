import { Plus } from 'lucide-react';

import { usePopup, type Model, type Ui } from '@/popup/entities/connection';
import { MENU_HEAD, MENU_ROW } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { PopoverContent } from '@/shared/ui/popover';
import { Separator } from '@/shared/ui/separator';

import { PlanMenuRow } from './PlanMenuRow';
import { ProviderGroup } from './ProviderGroup';

function openGroupId(model: Model, ui: Ui): string {
  const activeProvider = model.isOwn ? model.proxy?.providerId : undefined;
  return ui.openGroup ?? activeProvider ?? model.snapshot.providers[0]?.id ?? '';
}

function PlanSection() {
  const { snapshot } = usePopup();
  return (
    <>
      <div className={MENU_HEAD}>FlashProxy plans</div>
      {snapshot.plans.length === 0 ? (
        <div className={MENU_HEAD}>No active plans · buy one in the dashboard</div>
      ) : null}
      {snapshot.plans.map((plan) => (
        <PlanMenuRow key={plan.id} plan={plan} />
      ))}
    </>
  );
}

function AddProxyRow() {
  const { setUi, openAddProxy } = usePopup();
  const addProxy = () => {
    setUi({ srcOpen: false });
    openAddProxy();
  };
  return (
    <Button
      variant="ghost"
      className={cn(MENU_ROW, 'add text-fp-accent-ink text-sm font-semibold!')}
      onClick={addProxy}
    >
      <span className="border-fp-line2 flex size-7 flex-none items-center justify-center rounded-sm border-[1.5px] border-dashed">
        <Plus className="text-accent size-3.5!" />
      </span>
      Add proxy
    </Button>
  );
}

function SignInPrompt() {
  const { setUi } = usePopup();
  const signIn = () => {
    setUi({ srcOpen: false });
    send({ type: 'signIn', connect: false });
  };
  return (
    <>
      <Separator className="bg-fp-line mt-1.5" />
      <div className="text-fp-muted2 px-2 pt-2.5 pb-1 text-xs">
        Have a FlashProxy account?{' '}
        <Button
          variant="link"
          className="link-btn text-fp-accent-ink h-auto p-0 text-xs font-semibold!"
          onClick={signIn}
        >
          Add your FlashProxy API key
        </Button>
      </div>
    </>
  );
}

export function SourceMenu() {
  const { snapshot, model, ui } = usePopup();
  const openGroup = openGroupId(model, ui);
  return (
    <PopoverContent
      align="end"
      sideOffset={6}
      collisionPadding={10}
      className="max-h-117.5 w-90 overflow-y-auto rounded-lg! p-1.5 shadow-lg [scrollbar-width:thin]"
    >
      {model.signedIn ? <PlanSection /> : null}
      <div className={MENU_HEAD}>My proxies</div>
      {snapshot.providers.map((provider) => (
        <ProviderGroup
          key={provider.id}
          provider={provider}
          proxies={snapshot.ownProxies.filter((proxy) => proxy.providerId === provider.id)}
          open={openGroup === provider.id}
        />
      ))}
      <AddProxyRow />
      {model.signedIn ? null : <SignInPrompt />}
    </PopoverContent>
  );
}
