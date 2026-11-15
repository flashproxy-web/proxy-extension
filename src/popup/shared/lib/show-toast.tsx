import { toast } from 'sonner';

import { TOAST_BAD, TOAST_OK } from '@/shared/config';
import type { Toast } from '@/shared/model';

import { DynamicIcon } from '../ui/DynamicIcon';

const TOAST_ID = 'popup';

function toastVariant(color: Toast['color']) {
  if (color === TOAST_OK) return toast.success;
  if (color === TOAST_BAD) return toast.error;
  return toast.info;
}

export function showToast(message: Toast) {
  const show = toastVariant(message.color);
  show(message.text, {
    id: TOAST_ID,
    icon: <DynamicIcon name={message.icon} className="size-4" />,
  });
}
