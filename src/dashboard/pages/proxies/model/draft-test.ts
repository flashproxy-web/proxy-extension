import { useState } from 'react';

import { call } from '@/shared/api/client';
import { countryName } from '@/shared/lib/countries';
import type { TestResult } from '@/shared/model';

import { draftTestKey, isPort, proxyTarget, toDraft, type ProxyForm } from './proxy-form';

export type DraftTest =
  | { status: 'run' }
  | { status: 'ok'; result: Extract<TestResult, { ok: true }> }
  | { status: 'err'; title: string; detail: string };

const MISSING_HOST: DraftTest = {
  status: 'err',
  title: 'Add a host first',
  detail: 'Enter the proxy host, for example brd.superproxy.io.',
};
const BAD_PORT: DraftTest = {
  status: 'err',
  title: 'Port must be between 1 and 65535',
  detail: 'Check the port your provider gave you.',
};

export function useDraftTest(values: ProxyForm) {
  const [latest, setLatest] = useState<{ key: string; test: DraftTest } | null>(null);
  const key = draftTestKey(values);
  const test = latest?.key === key ? latest.test : null;

  const run = async () => {
    const { host, port } = proxyTarget(values);
    if (!host) return setLatest({ key, test: MISSING_HOST });
    if (!isPort(port)) return setLatest({ key, test: BAD_PORT });
    setLatest({ key, test: { status: 'run' } });
    const result = await call('testDraft', toDraft(values));
    setLatest({
      key,
      test: result.ok
        ? { status: 'ok', result }
        : { status: 'err', title: result.title, detail: result.detail },
    });
  };

  return { test, run };
}

export function describeDraftTest(
  test: DraftTest,
  host: string
): { title: string; detail: string } {
  switch (test.status) {
    case 'run':
      return {
        title: 'Testing connection…',
        detail: `Connecting through ${host || 'the proxy'} and checking the exit IP.`,
      };
    case 'ok': {
      const { cc, ip } = test.result.exit;
      return {
        title: `Connected${cc ? ' · exit in ' + countryName(cc) : ''}`,
        detail: ip ? `Exit IP ${ip} · checked just now` : 'Checked just now',
      };
    }
    case 'err':
      return { title: test.title, detail: test.detail };
  }
}
