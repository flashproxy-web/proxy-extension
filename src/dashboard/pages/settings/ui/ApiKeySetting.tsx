import { SettingRow } from '@/dashboard/shared/ui/SettingRow';
import { send } from '@/shared/api/client';
import type { Account } from '@/shared/model';
import { ApiKeyForm } from '@/shared/ui/ApiKeyForm';
import { Button } from '@/shared/ui/button';

export function ApiKeySetting({ account }: { account: Account | null }) {
  if (!account) {
    return (
      <div className="border-fp-line border-t px-5 py-4">
        <ApiKeyForm className="max-w-110" />
      </div>
    );
  }
  return (
    <SettingRow
      title="API key"
      description={`Connected as ${account.email}. The key is stored encrypted in this browser.`}
    >
      <Button variant="outline" onClick={() => send({ type: 'signOut' })}>
        Remove key
      </Button>
    </SettingRow>
  );
}
