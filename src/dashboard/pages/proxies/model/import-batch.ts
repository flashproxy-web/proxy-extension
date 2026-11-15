import { CircleAlert } from 'lucide-react';

import { AUTO_PROVIDER, type ImportMode } from '@/dashboard/shared/config';
import { plural } from '@/dashboard/shared/lib/format';
import { notify } from '@/dashboard/shared/lib/notify';
import { call } from '@/shared/api/client';
import { CUSTOM_PROVIDER } from '@/shared/config';
import { parseImportLine, type ImportLine } from '@/shared/lib/ownProxies';
import type { Provider } from '@/shared/model';

type ParsedLine = Extract<ImportLine, { proto: string }>;

export interface ImportBatch {
  lines: ImportLine[];
  ready: ParsedLine[];
  errors: number;
}

export function parseImportText(text: string): ImportBatch {
  const lines = text
    .split('\n')
    .map(parseImportLine)
    .filter((line): line is ImportLine => !!line);
  const ready = lines.filter((line): line is ParsedLine => !('err' in line));
  return { lines, ready, errors: lines.length - ready.length };
}

export function batchProviderName(
  providerId: string,
  providers: ReadonlyMap<string, Provider>
): string | null {
  if (providerId === AUTO_PROVIDER.id) return null;
  return providers.get(providerId)?.name ?? CUSTOM_PROVIDER.name;
}

export function batchStatus({ lines, ready, errors }: ImportBatch): string {
  if (!lines.length) return 'Nothing pasted yet';
  return `${lines.length} lines · ${ready.length} ready${errors ? ' · lines with errors are skipped' : ''}`;
}

export function importButtonLabel(mode: ImportMode, count: number): string {
  if (!count) return 'Nothing to import';
  return mode === 'pool'
    ? `Import pool of ${count}`
    : `Import ${plural(count, 'proxy', 'proxies')}`;
}

export async function importBatch(
  ready: ParsedLine[],
  mode: ImportMode,
  providerId: string,
  poolName: string
): Promise<boolean> {
  try {
    const imported = await call(
      'importProxies',
      ready.map((line) => ({
        protocol: line.proto,
        host: line.host,
        port: line.port,
        username: line.user,
        password: line.pass,
      })),
      mode,
      providerId,
      poolName
    );
    notify({
      text:
        mode === 'pool'
          ? `Imported a pool of ${imported} endpoints`
          : `Imported ${plural(imported, 'proxy', 'proxies')}`,
    });
    return true;
  } catch (error) {
    notify({ text: (error as Error).message, icon: CircleAlert, tone: 'warning' });
    return false;
  }
}
