const FAVICON_SIZE = '32';

export function favicon(domain: string): string | null {
  try {
    if (!chrome.runtime?.id) return null;
    return (
      chrome.runtime.getURL('/_favicon/') +
      '?' +
      new URLSearchParams({ pageUrl: `https://${domain}/`, size: FAVICON_SIZE })
    );
  } catch {
    return null;
  }
}
