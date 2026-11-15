import { Button } from '@/shared/ui/button';

export function StepBanner({
  message,
  action,
  disabled,
  onAction,
}: {
  message: string;
  action: string;
  disabled?: boolean;
  onAction: () => void;
}) {
  return (
    <div className="border-fp-soft-line bg-fp-soft flex items-center gap-2.5 rounded-md border px-3.5 py-3 text-sm">
      <span className="text-fp-accent-ink flex-1 font-medium">{message}</span>
      <Button size="sm" onClick={onAction} disabled={disabled} className="flex-none">
        {action}
      </Button>
    </div>
  );
}
