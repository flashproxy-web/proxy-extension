import { AUTO_PROVIDER, IMPORT_MODES, type ImportMode } from '@/dashboard/shared/config';
import { useDashboard } from '@/dashboard/shared/model';
import { ChipOption } from '@/dashboard/shared/ui/ChipOption';
import { Field } from '@/dashboard/shared/ui/Field';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

import { FormatList } from './FormatList';

export function PasteField({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <Field
      label="Paste proxies"
      hint={
        <Button
          variant="link"
          onClick={() => onChange('')}
          className="text-fp-muted2 hover:text-fp-ink h-auto p-0 text-xs font-normal hover:no-underline"
        >
          Clear
        </Button>
      }
    >
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        autoFocus
        placeholder="host:port:user:pass"
        className="[field-sizing:fixed] h-58 overflow-x-auto p-3 font-mono text-sm whitespace-pre md:text-sm"
      />
      <FormatList className="mt-2 flex flex-wrap gap-1" />
    </Field>
  );
}

export function ImportModeField({
  mode,
  onModeChange,
  poolName,
  onPoolNameChange,
  endpointCount,
}: {
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  poolName: string;
  onPoolNameChange: (name: string) => void;
  endpointCount: number;
}) {
  return (
    <Field label="Import as">
      <SegmentedControl
        fullWidth
        options={IMPORT_MODES}
        value={mode}
        onValueChange={onModeChange}
      />
      {mode === 'pool' ? (
        <>
          <Input
            className="mt-2"
            value={poolName}
            onChange={(event) => onPoolNameChange(event.target.value)}
            placeholder="Pool name"
          />
          <div className="text-fp-muted2 mt-1.5 text-xs">
            One entry with {endpointCount} endpoints, rotated round-robin. Change the strategy later
            from the pool's row.
          </div>
        </>
      ) : null}
    </Field>
  );
}

export function BatchProviderField({
  value,
  onChange,
}: {
  value: string;
  onChange: (providerId: string) => void;
}) {
  const { providers } = useDashboard().snapshot;

  return (
    <Field label="Provider for this batch">
      <div className="flex flex-wrap gap-1.5">
        {[AUTO_PROVIDER, ...providers].map((provider) => (
          <ChipOption
            key={provider.id}
            selected={value === provider.id}
            color={provider.color}
            initial={provider.initial}
            label={provider.name}
            onSelect={() => onChange(provider.id)}
          />
        ))}
      </div>
    </Field>
  );
}
