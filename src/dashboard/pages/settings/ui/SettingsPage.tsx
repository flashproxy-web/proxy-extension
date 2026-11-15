import { useDashboard } from '@/dashboard/shared/model';
import { PageHeader } from '@/dashboard/shared/ui/PageHeader';
import { SettingsCard } from '@/dashboard/shared/ui/SettingsCard';

import { ApiKeySetting } from './ApiKeySetting';
import { PopupLayoutSetting } from './PopupLayoutSetting';
import { ThemeSetting } from './ThemeSetting';

export function SettingsPage() {
  const { settings, account } = useDashboard().snapshot;

  return (
    <div data-screen-label="Settings">
      <PageHeader title="Settings" sub="A few preferences. Everything else lives in the popup." />
      <div className="max-w-205">
        <SettingsCard title="FlashProxy account">
          <ApiKeySetting account={account} />
        </SettingsCard>
        <SettingsCard title="General">
          <ThemeSetting theme={settings.theme} />
          <PopupLayoutSetting layout={settings.ui} />
        </SettingsCard>
      </div>
    </div>
  );
}
