import { EXT_PAGE, IN_EXTENSION } from '@/shared/config';

function openTab(url: string) {
  if (IN_EXTENSION) void chrome.tabs.create({ url });
  else window.open(url, '_blank');
}

export function openDashboard(query = '') {
  openTab(
    (IN_EXTENSION ? chrome.runtime.getURL(EXT_PAGE.dashboard) : `/${EXT_PAGE.dashboard}`) + query
  );
}

export function openPopup() {
  if (IN_EXTENSION && chrome.action.openPopup)
    void chrome.action.openPopup().catch(() => undefined);
}
