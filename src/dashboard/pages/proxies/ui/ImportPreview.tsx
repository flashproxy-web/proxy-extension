import { IMPORT_COLUMNS } from '@/dashboard/shared/config';
import { ToneBadge } from '@/dashboard/shared/ui/ToneBadge';
import type { ImportLine } from '@/shared/lib/ownProxies';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

import { ImportPreviewRow } from './ImportPreviewRow';

export function ImportPreview({
  lines,
  ready,
  errors,
  batchProvider,
}: {
  lines: ImportLine[];
  ready: number;
  errors: number;
  batchProvider: string | null;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2.5">
        <span className="text-sm font-semibold">Preview</span>
        <span className="flex gap-1.5">
          <ToneBadge tone="ok">{ready} ready</ToneBadge>
          {errors > 0 ? <ToneBadge tone="bad">{errors} with errors</ToneBadge> : null}
        </span>
      </div>
      <Card className="fp-card gap-0 overflow-hidden py-0">
        <div className="max-h-105 overflow-y-auto">
          <Table className="table-fixed text-xs">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-fp-panel hover:bg-fp-panel">
                {IMPORT_COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      'text-fp-muted2 h-auto py-2 text-xs font-semibold tracking-wider uppercase',
                      column.className
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <ImportPreviewRow
                  key={`${index + 1}:${line.raw}`}
                  number={index + 1}
                  line={line}
                  batchProvider={batchProvider}
                />
              ))}
            </TableBody>
          </Table>
          {lines.length ? null : (
            <div className="text-fp-muted2 px-4 py-9 text-center text-sm">
              Paste proxies on the left to preview them here.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
