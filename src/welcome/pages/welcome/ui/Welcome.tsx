// Opened once after install. Pinning is read from Chrome where it allows (the
// toolbar demo is also clickable); sign-in runs the same flow as the popup.

import { useThemeClass } from '@/shared/lib/use-theme-class';
import { TooltipProvider } from '@/shared/ui/tooltip';

import { SnapshotContext, useSnapshotSubscription } from '../model/snapshot';

import { HelpLinks } from './HelpLinks';
import { WelcomeActions } from './WelcomeActions';
import { WelcomeHeader } from './WelcomeHeader';
import { WelcomeSetup } from './WelcomeSetup';

export function Welcome() {
  const snapshot = useSnapshotSubscription();
  useThemeClass(snapshot?.settings.theme);

  return (
    <SnapshotContext value={snapshot}>
      <TooltipProvider>
        <div
          className="bg-muted text-fp-ink relative isolate min-h-screen overflow-hidden"
          data-screen-label="Welcome"
        >
          <div className="from-accent/15 absolute inset-x-0 top-0 -z-10 h-105 bg-radial-[at_top] to-transparent to-70%" />
          <WelcomeHeader />
          <main className="mx-auto max-w-240 px-6 pt-14 pb-24">
            <WelcomeSetup />
            <WelcomeActions />
            <HelpLinks />
          </main>
        </div>
      </TooltipProvider>
    </SnapshotContext>
  );
}
