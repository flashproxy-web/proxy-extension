import { usePopup } from '@/popup/entities/connection';
import { Onboarding } from '@/popup/pages/onboarding';
import { ProView } from '@/popup/pages/pro';
import { SignInScreen } from '@/popup/pages/sign-in';
import { SimpleFooter, SimpleView } from '@/popup/pages/simple';

export function PopupBody() {
  const { snapshot, model } = usePopup();
  const signIn = snapshot.runtime.signin;
  if (signIn) return <SignInScreen signIn={signIn} />;
  if (!model.hasAny) return <Onboarding />;
  if (snapshot.settings.ui !== 'simple') return <ProView />;
  return (
    <>
      <SimpleView />
      <SimpleFooter />
    </>
  );
}
