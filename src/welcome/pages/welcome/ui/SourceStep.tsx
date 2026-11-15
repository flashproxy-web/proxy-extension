import { ToggleGroup } from '@/shared/ui/toggle-group';

import { SOURCE_CHOICES, STEP_COPY, type SourceKey } from '../config';

import { OwnProxiesBanner } from './OwnProxiesBanner';
import { SignInBanner } from './SignInBanner';
import { SourceChoice } from './SourceChoice';
import { StepCard } from './StepCard';

export function SourceStep({
  source,
  done,
  onChoose,
}: {
  source: SourceKey | null;
  done: boolean;
  onChoose: (source: SourceKey) => void;
}) {
  const handleValueChange = (value: string) => {
    const picked = SOURCE_CHOICES.find((option) => option.key === value)?.key ?? source;
    if (picked) onChoose(picked);
  };

  return (
    <StepCard tone={done ? 'done' : 'todo'} label="2" copy={STEP_COPY.source}>
      <ToggleGroup
        type="single"
        spacing={2.5}
        value={source ?? ''}
        onValueChange={handleValueChange}
        aria-label="Connection source"
        className="w-full flex-col items-stretch"
      >
        {SOURCE_CHOICES.map((option) => (
          <SourceChoice key={option.key} option={option} />
        ))}
      </ToggleGroup>
      <div className="text-fp-muted2 text-center text-xs">You can add the other later.</div>
      {source === 'fp' ? <SignInBanner /> : null}
      {source === 'own' ? <OwnProxiesBanner /> : null}
    </StepCard>
  );
}
