import { CHIP_ON, ISP_CHOICES } from '@/popup/shared/config';
import { cn } from '@/shared/lib/utils';
import type { IspChoice } from '@/shared/model';
import { Button } from '@/shared/ui/button';

export function IspChips({
  value,
  ispLabel,
  onChange,
}: {
  value: IspChoice;
  ispLabel: string;
  onChange: (value: IspChoice) => void;
}) {
  const labels: Record<IspChoice, string> = {
    any: 'Any ISP',
    isp: ispLabel,
    mob: 'Mobile carriers',
  };
  return (
    <div className="flex flex-wrap gap-1.5 px-2 pb-2">
      {ISP_CHOICES.map((choice) => (
        <Button
          key={choice}
          variant="outline"
          className={cn(
            'h-7 rounded-full! px-2.5 text-xs font-semibold!',
            value === choice && CHIP_ON
          )}
          onClick={() => onChange(choice)}
        >
          {labels[choice]}
        </Button>
      ))}
    </div>
  );
}
