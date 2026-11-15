import { targetName, type Model } from '@/popup/entities/connection';
import type { Route } from '@/shared/lib/routing';
import type { SiteRule } from '@/shared/model';

export function siteRuleText(
  model: Model,
  site: string,
  userRule: SiteRule | undefined,
  route: Route
): string {
  const { snapshot } = model;
  if (userRule) {
    return `Your rule · ${site} → ${userRule === 'proxy' ? 'always proxy' : 'direct'}`;
  }
  if (route.source === 'rule') {
    return `Rule #${route.index + 1} · ${route.rule.pattern} → ${targetName(route.rule.target, snapshot)}`;
  }
  switch (snapshot.settings.mode) {
    case 'smart':
      return 'No rule matches · Smart sends this site direct';
    case 'global':
      return `Global mode · every site → ${model.profileName}`;
    case 'system':
      return 'System mode · follows your OS proxy settings';
    default:
      return 'Direct mode · no proxy';
  }
}
