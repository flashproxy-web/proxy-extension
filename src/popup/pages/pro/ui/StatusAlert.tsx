import { ALERT_TONE } from '@/popup/shared/config';
import { DynamicIcon } from '@/popup/shared/ui/DynamicIcon';
import { cn } from '@/shared/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

import type { AlertSpec } from '../model/alerts';

export function StatusAlert({ spec }: { spec: AlertSpec }) {
  const tone = ALERT_TONE[spec.tone];
  return (
    <Alert
      className={cn(
        'animate-in fade-in-0 rounded-md p-3 duration-200 has-[>svg]:gap-x-2.5',
        tone.box
      )}
    >
      <DynamicIcon name={spec.icon} className="size-4" style={{ color: tone.color }} />
      <AlertTitle className="text-sm font-semibold">{spec.title}</AlertTitle>
      <AlertDescription className="text-fp-muted text-xs leading-snug">
        {spec.description}
      </AlertDescription>
      <div className="col-span-2 mt-2.5 flex flex-wrap gap-1.5">
        {spec.actions.map((action) => (
          <Button
            key={action.label}
            variant={action.primary ? 'default' : 'outline'}
            className="h-7 px-2.75 text-xs font-semibold!"
            onClick={action.run}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </Alert>
  );
}
