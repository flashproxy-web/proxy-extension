import { createElement, type CSSProperties } from 'react';

import { cn } from '@/shared/lib/utils';

import { iconFor } from '../lib/icons';

export function DynamicIcon({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  return createElement(iconFor(name), { 'aria-hidden': true, className: cn('flex-none', className), style });
}
