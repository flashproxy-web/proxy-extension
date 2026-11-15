import { REQUIRED_STEPS } from '../config';

function progressLabel(completedSteps: number): string {
  if (completedSteps === REQUIRED_STEPS) return 'All set';
  return `${completedSteps} of ${REQUIRED_STEPS} done`;
}

export function SetupProgress({ completedSteps }: { completedSteps: number }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2.5">
      <div className="bg-fp-panel ring-fp-line h-1.5 w-55 overflow-hidden rounded-full ring-1 ring-inset">
        <div
          className="bg-accent h-full rounded-full transition-all duration-350 ease-in-out"
          style={{ width: `${(completedSteps / REQUIRED_STEPS) * 100}%` }}
        />
      </div>
      <span className="text-fp-muted2 text-sm tabular-nums">{progressLabel(completedSteps)}</span>
    </div>
  );
}
