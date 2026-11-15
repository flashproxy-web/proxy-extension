import { NO_AUTH_PROTOCOLS } from '@/shared/config';
import type { Protocol, ProxyDraft, TestResult } from '@/shared/model';

import { PROBE, TEST_SHORT } from './config';
import { recordHealth, serverFor, toServer, type Health } from './ownProxies';
import { controlConflict, testThrough, type Server } from './proxy';
import { current, setRuntime } from './store';

const NOT_TESTED: TestResult = {
  ok: false,
  title: 'Test stopped',
  detail: '',
  short: TEST_SHORT.notTested,
};

const CONFLICT: TestResult = {
  ok: false,
  title: 'Another extension controls the proxy',
  detail: 'Take back control in the popup, then test again.',
  short: TEST_SHORT.notTested,
};

const FAILURE: Record<'auth' | 'timeout' | 'refused', TestResult> = {
  auth: {
    ok: false,
    title: 'The proxy rejected the username or password',
    detail: 'Check the credentials your provider gave you.',
    short: TEST_SHORT.auth,
  },
  timeout: {
    ok: false,
    title: `Connection timed out after ${PROBE.timeoutMs / 1000} s`,
    detail: 'The proxy didn’t answer. Check the host, port and that your IP is allowed.',
    short: TEST_SHORT.timeout,
  },
  refused: {
    ok: false,
    title: 'Couldn’t connect through this proxy',
    detail: 'The connection was refused. Check the host, port and that your IP is allowed.',
    short: TEST_SHORT.refused,
  },
};

const healthOf = (result: TestResult): Health =>
  result.ok
    ? { healthy: true, cc: result.exit.cc, latency: result.ms, error: null }
    : { healthy: false, cc: null, latency: null, error: result.short };

let queue: Promise<unknown> = Promise.resolve();
let stopRequested = false;

function runTest(server: Server, protocol: Protocol): Promise<TestResult> {
  const run = async (): Promise<TestResult> => {
    if (NO_AUTH_PROTOCOLS.includes(protocol) && server.username) {
      return {
        ok: false,
        title: 'Chrome can’t log in to this proxy',
        detail: `${protocol} with a username and password won’t authenticate in Chrome. Use IP whitelisting.`,
        short: TEST_SHORT.cantLogin,
      };
    }
    if (current().runtime.status === 'conflict' || (await controlConflict())) return CONFLICT;
    const { mode, siteRules } = current().settings;
    const outcome = await testThrough(server, mode, siteRules);
    return outcome.ok ? outcome : FAILURE[outcome.kind];
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

export async function testDraft(draft: ProxyDraft): Promise<TestResult> {
  const endpoint = draft.endpoints[0];
  if (!endpoint)
    return {
      ok: false,
      title: 'Add a host first',
      detail: 'Enter the proxy host, for example brd.superproxy.io.',
      short: TEST_SHORT.notTested,
    };
  const credentials = draft.username
    ? { username: draft.username, password: draft.password }
    : null;
  return runTest(toServer(draft.protocol, endpoint, credentials), draft.protocol);
}

export async function testProxy(id: string): Promise<TestResult> {
  const proxy = current().ownProxies.find((item) => item.id === id);
  if (!proxy)
    return { ok: false, title: 'Proxy not found', detail: '', short: TEST_SHORT.notTested };
  setRuntime({ testing: [...current().runtime.testing, id] });
  const byEndpoint = new Map<number, Health>();
  let best: TestResult | null = null;
  try {
    for (const [index, endpoint] of proxy.endpoints.entries()) {
      if (stopRequested) break;
      const result = await serverFor(proxy, endpoint).then(
        (server) => runTest(server, proxy.protocol),
        (error: Error): TestResult => ({
          ok: false,
          title: error.message,
          detail: '',
          short: TEST_SHORT.auth,
        })
      );
      byEndpoint.set(index, healthOf(result));
      if (!best || (result.ok && (!best.ok || result.ms < best.ms))) best = result;
    }
    if (best) recordHealth(id, healthOf(best), byEndpoint);
  } finally {
    setRuntime({ testing: current().runtime.testing.filter((item) => item !== id) });
  }
  return best ?? NOT_TESTED;
}

export async function testAll(): Promise<{
  total: number;
  healthy: number;
  failing: number;
  stopped: boolean;
}> {
  const ids = current().ownProxies.map((proxy) => proxy.id);
  stopRequested = false;
  let healthy = 0;
  let failing = 0;
  setRuntime({ testRun: { total: ids.length, done: 0 } });
  for (const id of ids) {
    if (stopRequested) break;
    const result = await testProxy(id);
    if (stopRequested) break;
    if (result.ok) healthy++;
    else failing++;
    setRuntime({ testRun: { total: ids.length, done: healthy + failing } });
  }
  const stopped = stopRequested;
  stopRequested = false;
  setRuntime({ testRun: null, testing: [] });
  return { total: ids.length, healthy, failing, stopped };
}

export function stopTesting() {
  stopRequested = true;
}
