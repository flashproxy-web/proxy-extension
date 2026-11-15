import { IMPORT_FORMATS } from '@/dashboard/shared/config';
import { CodeChip } from '@/dashboard/shared/ui/CodeChip';

export function FormatList({ className }: { className?: string }) {
  return (
    <div className={className}>
      {IMPORT_FORMATS.map((format) => (
        <CodeChip key={format}>{format}</CodeChip>
      ))}
    </div>
  );
}
