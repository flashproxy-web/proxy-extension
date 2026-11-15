import { ListFilter, Plus } from 'lucide-react';
import { useState } from 'react';

import { notify } from '@/dashboard/shared/lib/notify';
import { useDashboard } from '@/dashboard/shared/model';
import { EmptyCard } from '@/dashboard/shared/ui/EmptyCard';
import { PageHeader } from '@/dashboard/shared/ui/PageHeader';
import { call } from '@/shared/api/client';
import type { RuleTarget } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

import { allTargets } from '../lib/targets';
import { removeSiteRule } from '../model/rule-actions';
import { sampleUrlFor, shouldPrefillTest, testRuleUrl } from '../model/rule-test';

import { AddRuleForm } from './AddRuleForm';
import { RuleList } from './RuleList';
import { RuleTester } from './RuleTester';
import { SiteRules } from './SiteRules';
import { SmartModeNote } from './SmartModeNote';

export function RulesPage() {
  const { snapshot, lookup, query } = useDashboard();
  const [testUrl, setTestUrl] = useState('');
  const [adding, setAdding] = useState(query.get('add') === '1');

  const { rules } = snapshot;
  const { siteRules } = snapshot.settings;
  const result = testRuleUrl(testUrl, snapshot, lookup);

  const addRule = async (pattern: string, target: RuleTarget) => {
    await call('addRule', pattern, target);
    setAdding(false);
    if (shouldPrefillTest(pattern)) setTestUrl(sampleUrlFor(pattern));
    notify({ text: 'Rule added at the top' });
  };

  const startAdding = () => setAdding(true);

  return (
    <div data-screen-label="Rules">
      <PageHeader
        title="Rules"
        sub="Send matching sites through a proxy, direct, or block them. The first match wins."
      >
        <AddRuleButton onClick={startAdding} />
      </PageHeader>
      <SmartModeNote />

      {rules.length > 0 || adding ? (
        <Card className="fp-card gap-0 py-0">
          <RuleTester value={testUrl} onChange={setTestUrl} result={result} />
          {adding ? (
            <AddRuleForm
              options={allTargets(snapshot, lookup)}
              onAdd={addRule}
              onCancel={() => setAdding(false)}
            />
          ) : null}
          <RuleList result={result} />
        </Card>
      ) : (
        <NoRules onAdd={startAdding} />
      )}

      <SiteRules
        siteRules={siteRules}
        onRemove={(domain) => void removeSiteRule(siteRules, domain)}
      />
    </div>
  );
}

function AddRuleButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus />
      Add rule
    </Button>
  );
}

function NoRules({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyCard
      icon={ListFilter}
      title="No rules yet"
      text="Add a rule to send one site through a proxy and keep everything else direct. Rules run in Smart mode."
    >
      <div className="mt-1.5 flex gap-2">
        <AddRuleButton onClick={onAdd} />
      </div>
    </EmptyCard>
  );
}
