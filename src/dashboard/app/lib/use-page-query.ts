import { useState } from 'react';

import { PAGE_BY_ID } from '@/dashboard/shared/config';
import type { Navigate, Page } from '@/dashboard/shared/model';

export function usePageQuery(onNavigate: () => void) {
  const [query, setQuery] = useState(() => new URLSearchParams(location.search));
  const page: Page = PAGE_BY_ID.get(query.get('page') as Page)?.page ?? 'proxies';

  const go: Navigate = (nextPage, params = {}) => {
    const next = new URLSearchParams({ page: nextPage, ...params });
    history.replaceState(null, '', '?' + next.toString());
    setQuery(next);
    onNavigate();
  };

  return { query, page, go };
}
