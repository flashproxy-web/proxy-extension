import { createElement } from 'react';
import { toast } from 'sonner';

import { TOAST_ID, TOAST_MS, UNDO_TOAST_MS } from '../config';

import type { DashToast } from '../model';

export function notify({ text, icon, tone = 'success', undo }: DashToast) {
  toast[tone](text, {
    id: TOAST_ID,
    icon: icon ? createElement(icon, { className: 'size-4', 'aria-hidden': true }) : undefined,
    duration: undo ? UNDO_TOAST_MS : TOAST_MS,
    action: undo ? { label: 'Undo', onClick: undo } : undefined,
  });
}
