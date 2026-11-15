import { Check, CircleX, TriangleAlert } from 'lucide-react';

import { CUSTOM_PROVIDER } from '@/shared/config';
import type { ImportLine } from '@/shared/lib/ownProxies';
import { cn } from '@/shared/lib/utils';
import { TableCell, TableRow } from '@/shared/ui/table';

type FailedLine = Extract<ImportLine, { err: string }>;
type ParsedLine = Exclude<ImportLine, FailedLine>;

export function ImportPreviewRow({
  number,
  line,
  batchProvider,
}: {
  number: number;
  line: ImportLine;
  batchProvider: string | null;
}) {
  if ('err' in line) return <FailedRow number={number} line={line} />;
  return <ParsedRow number={number} line={line} batchProvider={batchProvider} />;
}

function FailedRow({ number, line }: { number: number; line: FailedLine }) {
  return (
    <TableRow className="border-fp-line bg-fp-red/5 hover:bg-fp-red/5">
      <TableCell className="text-fp-muted2 font-mono">{number}</TableCell>
      <TableCell className="min-w-0">
        <code className={cn('block truncate', line.host ? 'text-fp-ink' : 'text-fp-muted2')}>
          {line.host || '—'}
        </code>
        <code className="text-fp-red block truncate text-xs">{line.raw}</code>
      </TableCell>
      <TableCell>
        <code>{line.port || '—'}</code>
      </TableCell>
      <TableCell>
        <code className="text-fp-muted block truncate">{line.user || '—'}</code>
      </TableCell>
      <TableCell>
        <span className="text-fp-red flex min-w-0 items-center gap-1.5 font-medium">
          <CircleX className="size-3.5 shrink-0" />
          <span className="truncate">{line.err}</span>
        </span>
      </TableCell>
    </TableRow>
  );
}

function ParsedRow({
  number,
  line,
  batchProvider,
}: {
  number: number;
  line: ParsedLine;
  batchProvider: string | null;
}) {
  return (
    <TableRow className="border-fp-line">
      <TableCell className="text-fp-muted2 font-mono">{number}</TableCell>
      <TableCell>
        <code className="block truncate">{line.host}</code>
      </TableCell>
      <TableCell>
        <code>{line.port}</code>
      </TableCell>
      <TableCell>
        <code className="text-fp-muted block truncate">{line.user || 'no auth'}</code>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'flex min-w-0 items-center gap-1.5 font-medium',
            line.warn ? 'text-fp-amber' : 'text-fp-green'
          )}
        >
          {line.warn ? (
            <TriangleAlert className="size-3.5 shrink-0" />
          ) : (
            <Check className="size-3.5 shrink-0" />
          )}
          <span className="truncate">
            {line.warn ||
              `${line.proto} · ${batchProvider ?? line.det?.name ?? CUSTOM_PROVIDER.name}`}
          </span>
        </span>
      </TableCell>
    </TableRow>
  );
}
