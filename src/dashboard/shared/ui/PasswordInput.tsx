import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { TooltipHint } from '@/shared/ui/tooltip-hint';

import type { ComponentProps } from 'react';

export function PasswordInput({ className, ...props }: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [shown, setShown] = useState(false);
  const toggleLabel = shown ? 'Hide password' : 'Show password';

  return (
    <div className="relative">
      <Input type={shown ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <TooltipHint label={toggleLabel}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-fp-muted absolute top-0.5 right-0.5 size-8"
          aria-label={toggleLabel}
          onClick={() => setShown((previous) => !previous)}
        >
          {shown ? <EyeOff /> : <Eye />}
        </Button>
      </TooltipHint>
    </div>
  );
}
