import { useSetupProgress } from '../model/use-setup-progress';

import { PinStep } from './PinStep';
import { PopupLayoutStep } from './PopupLayoutStep';
import { RoutingModes } from './RoutingModes';
import { SourceStep } from './SourceStep';
import { WelcomeHero } from './WelcomeHero';

export function WelcomeSetup() {
  const { pinned, demoPinned, toggleDemoPin, source, sourceDone, chooseSource, completedSteps } =
    useSetupProgress();

  return (
    <>
      <WelcomeHero completedSteps={completedSteps} />
      <div className="flex flex-col gap-3.5">
        <PinStep pinned={pinned} demoPinned={demoPinned} onToggleDemoPin={toggleDemoPin} />
        <SourceStep source={source} done={sourceDone} onChoose={chooseSource} />
        <PopupLayoutStep />
        <RoutingModes />
      </div>
    </>
  );
}
