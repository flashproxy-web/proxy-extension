import { Check } from 'lucide-react';

import type { SignIn } from '@/shared/model';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';

export function SignInBadge({ stage }: { stage: SignIn['stage'] }) {
  if (stage === 'enter') {
    return (
      <span className="bg-fp-soft flex size-16 items-center justify-center rounded-full">
        <FlashProxyStar size={26} />
      </span>
    );
  }
  return (
    <span className="bg-fp-green/12 flex size-16 items-center justify-center rounded-full">
      <Check className="text-fp-green size-7" />
    </span>
  );
}
