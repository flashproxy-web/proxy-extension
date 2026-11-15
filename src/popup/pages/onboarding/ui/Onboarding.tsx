import { PlugZap } from 'lucide-react';

import { usePopup } from '@/popup/entities/connection';
import { send } from '@/shared/api/client';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';

import { OnboardingChoice } from './OnboardingChoice';

const STAR_ICON = <FlashProxyStar size={24} />;
const PLUG_ICON = <PlugZap className="text-accent size-5.5!" />;

const signIn = () => send({ type: 'signIn', connect: true });

export function Onboarding() {
  const { openAddProxy } = usePopup();
  return (
    <div className="animate-in fade-in-0 flex flex-1 flex-col justify-center gap-3 px-4.5 py-6 duration-300">
      <div className="px-0.5 text-xl leading-tight font-bold tracking-tight">
        How do you want to connect?
      </div>
      <div className="text-fp-muted mb-1.5 px-0.5 text-sm leading-normal">
        Both can run side by side, in the same rules and pools.
      </div>
      <OnboardingChoice
        title="Use my FlashProxy plans"
        description="Add the API key from your FlashProxy account."
        icon={STAR_ICON}
        onClick={signIn}
      />
      <OnboardingChoice
        title="Use my own proxies"
        description="Add proxies from any provider."
        icon={PLUG_ICON}
        onClick={openAddProxy}
      />
      <div className="text-fp-muted2 mt-1 text-center text-xs">You can add the other later.</div>
    </div>
  );
}
