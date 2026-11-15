export function toggled<Item>(
  set: ReadonlySet<Item>,
  item: Item,
  on = !set.has(item)
): ReadonlySet<Item> {
  const next = new Set(set);
  if (on) next.add(item);
  else next.delete(item);
  return next;
}
