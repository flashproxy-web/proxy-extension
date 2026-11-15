import { useEffect, useState } from 'react';

import { popupContext, type PopupContext } from '@/popup/shared/api';

const INITIAL_ENVIRONMENT: PopupContext = { tab: null };

export function usePopupEnvironment(): PopupContext {
  const [environment, setEnvironment] = useState<PopupContext>(INITIAL_ENVIRONMENT);
  useEffect(() => {
    void popupContext().then(setEnvironment);
  }, []);
  return environment;
}
