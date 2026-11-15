import { Activity, Plus, Upload } from 'lucide-react';

import { useDashboard } from '@/dashboard/shared/model';
import { Button } from '@/shared/ui/button';

import { useProxiesPage } from '../model/proxies-page-context';
import { testAllProxies } from '../model/proxy-actions';

export function OwnProxiesActions() {
  const { snapshot } = useDashboard();
  const { addProxy, openImport } = useProxiesPage();
  const count = snapshot.ownProxies.length;
  const running = !!snapshot.runtime.testRun;

  return (
    <>
      {count > 0 ? (
        <Button variant="outline" onClick={() => void testAllProxies(running, count)}>
          <Activity />
          {running ? 'Stop testing' : 'Test all'}
        </Button>
      ) : null}
      <Button variant="outline" onClick={openImport}>
        <Upload />
        Import
      </Button>
      <Button onClick={() => addProxy()}>
        <Plus />
        Add proxy
      </Button>
    </>
  );
}
