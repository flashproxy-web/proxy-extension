import { useEffect, useRef, useState } from 'react';

import { COPIED_MS } from '../config';

export function useClipboardCopy(): { copied: boolean; copy: (text: string | null) => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = (text: string | null) => {
    if (!text) return;
    void navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };
  return { copied, copy };
}
