import { PRODUCT_NAME, VERSION } from '@/shared/config';
import { Badge } from '@/shared/ui/badge';

import { SetupProgress } from './SetupProgress';

export function WelcomeHero({ completedSteps }: { completedSteps: number }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2.5 mx-auto mb-10 max-w-155 text-center duration-400 ease-out">
      <Badge
        variant="outline"
        className="border-fp-line bg-card text-fp-muted h-7.5 gap-2 rounded-full px-3 text-sm font-medium"
      >
        <span className="bg-fp-green size-1.75 rounded-full" />
        Installed · v{VERSION}
      </Badge>
      <h1 className="mt-4.5 text-4xl leading-none font-bold tracking-tighter text-balance md:text-5xl">
        Welcome to {PRODUCT_NAME}
      </h1>
      <p className="text-fp-muted mt-3.5 text-base leading-relaxed">
        Two quick steps and you're ready to switch locations from the toolbar.
      </p>
      <SetupProgress completedSteps={completedSteps} />
    </div>
  );
}
