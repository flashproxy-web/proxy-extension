import { Trash2 } from 'lucide-react';

import { notify } from '@/dashboard/shared/lib/notify';
import { call } from '@/shared/api/client';
import type { Rule, SiteRule } from '@/shared/model';

export const saveRules = (rules: Rule[]) => call('setRules', rules);

export const toggleRule = (rules: Rule[], id: string) =>
  saveRules(rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)));

export async function deleteRule(rules: Rule[], deleted: Rule) {
  await saveRules(rules.filter((rule) => rule.id !== deleted.id));
  notify({
    text: 'Deleted rule ' + deleted.pattern,
    icon: Trash2,
    tone: 'error',
    undo: () => void saveRules(rules),
  });
}

export async function removeSiteRule(siteRules: Record<string, SiteRule>, domain: string) {
  const previous = { ...siteRules };
  const { [domain]: _removed, ...next } = previous;
  await call('setSiteRules', next);
  notify({ text: domain + ' removed', undo: () => void call('setSiteRules', previous) });
}
