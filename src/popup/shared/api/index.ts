import { IN_EXTENSION } from '@/shared/config';

export interface PopupContext {
  /** The active tab, when it is a web page. */
  tab: { host: string; url: string; favicon: string | null } | null;
}

const WEB_PROTOCOLS = ['http:', 'https:'];

const NO_CONTEXT: PopupContext = { tab: null };

async function activeTab(): Promise<PopupContext['tab']> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  const url = new URL(tab.url);
  if (!WEB_PROTOCOLS.includes(url.protocol)) return null;
  return { host: url.hostname, url: tab.url, favicon: tab.favIconUrl ?? null };
}

export async function popupContext(): Promise<PopupContext> {
  if (!IN_EXTENSION) return NO_CONTEXT;
  return { tab: await activeTab().catch(() => null) };
}
