import type { SignIn } from '@/shared/model';

import { signInCopy } from '../model/copy';

import { SignInBadge } from './SignInBadge';
import { SignInEnterKey } from './SignInEnterKey';
import { SignInPlans } from './SignInPlans';

function SignInStage({ signIn }: { signIn: SignIn }) {
  switch (signIn.stage) {
    case 'enter':
      return <SignInEnterKey />;
    case 'load':
      return <SignInPlans signIn={signIn} />;
  }
}

export function SignInScreen({ signIn }: { signIn: SignIn }) {
  const { title, description } = signInCopy(signIn);
  return (
    <div
      key={signIn.stage}
      className="animate-in fade-in-0 flex flex-1 flex-col justify-center gap-4 px-5.5 py-6 duration-300"
    >
      <div className="flex justify-center">
        <SignInBadge stage={signIn.stage} />
      </div>
      <div className="text-center">
        <div className="text-xl leading-tight font-bold tracking-tight">{title}</div>
        <div className="text-fp-muted mt-1.5 text-sm leading-normal text-pretty">{description}</div>
      </div>
      <SignInStage signIn={signIn} />
    </div>
  );
}
