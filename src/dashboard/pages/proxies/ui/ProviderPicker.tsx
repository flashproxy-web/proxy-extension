import { NEW_PROVIDER_PREFIX } from '@/dashboard/shared/config';
import { ChipOption } from '@/dashboard/shared/ui/ChipOption';
import { Hint } from '@/dashboard/shared/ui/Hint';
import { SWATCHES } from '@/shared/lib/ownProxies';
import type { Provider } from '@/shared/model';

type ProviderOption = Pick<Provider, 'id' | 'name' | 'color'>;

function providerOptions(
  providers: Provider[],
  newProvider: string | null,
  detectedColor: string | undefined
): ProviderOption[] {
  const options: ProviderOption[] = providers.map(({ id, name, color }) => ({ id, name, color }));
  if (!newProvider) return options;
  return [
    ...options,
    {
      id: NEW_PROVIDER_PREFIX + newProvider,
      name: newProvider,
      color: detectedColor ?? SWATCHES[providers.length % SWATCHES.length],
    },
  ];
}

export function ProviderPicker({
  providers,
  value,
  newProvider,
  detectedColor,
  onPick,
}: {
  providers: Provider[];
  value: string | null;
  newProvider: string | null;
  detectedColor: string | undefined;
  onPick: (id: string) => void;
}) {
  const options = providerOptions(providers, newProvider, detectedColor);

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <ChipOption
          key={option.id}
          selected={value === option.id}
          color={option.color}
          initial={option.name[0].toUpperCase()}
          label={option.name}
          onSelect={() => onPick(option.id)}
        />
      ))}
      {options.length ? null : (
        <Hint>Detected from the host when you type it. Otherwise it goes under Custom.</Hint>
      )}
    </div>
  );
}
