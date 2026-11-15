import { Button } from '@/shared/ui/button';
import { FlagTile } from '@/shared/ui/FlagTile';

export function FavouriteChips({
  codes,
  onPick,
}: {
  codes: string[];
  onPick: (code: string) => void;
}) {
  if (codes.length === 0) {
    return (
      <div className="text-fp-muted2 px-2 pb-2 text-xs">
        Tap ☆ next to a country to pin it here.
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5 px-2 pb-1.5">
      {codes.map((code) => (
        <Button
          key={code}
          variant="outline"
          className="h-7.5 gap-1.5 rounded-full! pr-2.5 pl-1.5 text-xs font-semibold!"
          onClick={() => onPick(code)}
        >
          <FlagTile cc={code} size="xs" className="shadow-none" />
          {code.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
