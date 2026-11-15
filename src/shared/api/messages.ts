import type { Action, Snapshot, Toast } from '../model';

export const SNAPSHOT_PORT = 'snapshot';

export type PortMessage = { type: 'snapshot'; snapshot: Snapshot } | { type: 'toast'; toast: Toast };

export type RuntimeMessage = { type: 'action'; action: Action } | { type: 'rpc'; method: string; args: unknown[] };

export type RpcResponse = { ok: true; value: unknown } | { ok: false; error: string };
