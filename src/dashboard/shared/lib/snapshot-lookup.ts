import type { OwnProxy, Plan, Provider, Snapshot } from '@/shared/model';

export interface SnapshotLookup {
  proxies: ReadonlyMap<string, OwnProxy>;
  providers: ReadonlyMap<string, Provider>;
  plans: ReadonlyMap<string, Plan>;
}

const byId = <Item extends { id: string }>(items: readonly Item[]) =>
  new Map(items.map((item) => [item.id, item]));

export function createSnapshotLookup(snapshot: Snapshot): SnapshotLookup {
  return {
    proxies: byId(snapshot.ownProxies),
    providers: byId(snapshot.providers),
    plans: byId(snapshot.plans),
  };
}
