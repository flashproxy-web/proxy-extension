import {
  ArrowUpRight,
  Globe,
  ListFilter,
  PlugZap,
  Power,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

import { PRODUCT_NAME } from '@/shared/config';
import type { PopupUi } from '@/shared/model';
import { FlashProxyStar } from '@/shared/ui/FlashProxyStar';

import type { ComponentType } from 'react';

export const POLL_INTERVAL_MS = 1500;
export const PULSE_DURATION = '1.6s';
export const REQUIRED_STEPS = 2;

export const PREVIEW_URL = 'flashproxy.com/welcome';

export type SourceKey = 'fp' | 'own';
export type IconComponent = ComponentType<{ size?: number; className?: string }>;

export interface StepCopy {
  kicker: string;
  title: string;
  description: string;
}

export interface SourceOption {
  key: SourceKey;
  title: string;
  description: string;
  icon: IconComponent;
}

export interface RoutingMode {
  id: string;
  icon: LucideIcon;
  title: string;
  via: string | null;
  target: string;
  text: string;
  good: string;
}

export interface PopupLayout {
  key: PopupUi;
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
  recommended: boolean;
}

export const STEP_COPY = {
  pin: {
    kicker: 'Step 1',
    title: 'Pin it to your toolbar',
    description:
      'Chrome hides new extensions behind the puzzle icon. Pin FlashProxy so it’s one click away. Try it here.',
  },
  source: {
    kicker: 'Step 2',
    title: 'Choose how to connect',
    description:
      'Use your FlashProxy plans, proxies from any provider, or both side by side in the same rules and pools.',
  },
} as const satisfies Record<string, StepCopy>;

export const PIN_HINTS = {
  pinned: 'Pinned. FlashProxy now sits next to the puzzle icon.',
  menuOpen: `Now click the pin next to ${PRODUCT_NAME}.`,
  idle: 'Click the puzzle icon in the toolbar.',
} as const;

export const SOURCE_CHOICES: SourceOption[] = [
  {
    key: 'fp',
    title: 'Use my FlashProxy plans',
    description: 'Add the API key from your FlashProxy account.',
    icon: FlashProxyStar,
  },
  {
    key: 'own',
    title: 'Use my own proxies',
    description: 'Add proxies from any provider.',
    icon: PlugZap,
  },
];

export const SIGN_IN_COPY = {
  load: 'Loading your plans…',
  idle: 'Add your FlashProxy API key in the extension’s settings to load your plans.',
} as const;

export const SIGN_IN_ACTIONS = { done: 'Done', loading: 'Loading…', signIn: 'Add API key' } as const;

export const OWN_PROXIES_HINT = 'Add one proxy or paste a whole list in the dashboard.';

export const ROUTING_MODES: RoutingMode[] = [
  {
    id: 'global',
    icon: Globe,
    title: 'Global',
    via: 'Proxy',
    target: 'every site',
    text: 'Every site goes through the proxy you picked.',
    good: 'Good for: testing a whole site from another country.',
  },
  {
    id: 'smart',
    icon: ListFilter,
    title: 'Smart rules',
    via: 'Rules',
    target: 'proxy or direct',
    text: 'Only sites that match your rules use a proxy. The rest go direct.',
    good: 'Good for: one or two sites, normal browsing for the rest.',
  },
  {
    id: 'direct',
    icon: ArrowUpRight,
    title: 'Direct',
    via: null,
    target: 'every site',
    text: 'No proxy. Your normal connection, like the extension is off.',
    good: 'Good for: pausing without changing your setup.',
  },
];

export const POPUP_LAYOUTS: PopupLayout[] = [
  {
    key: 'simple',
    title: 'Simple',
    description: 'One button, a location and a new IP when you need it.',
    icon: Power,
    items: ['On / off', 'Connect via', 'Proxy on this site', 'New IP'],
    recommended: true,
  },
  {
    key: 'pro',
    title: 'Pro',
    description: 'Everything in Simple, plus full control.',
    icon: SlidersHorizontal,
    items: ['Smart rules', 'Sticky or rotating', 'Site rules', '/ commands'],
    recommended: false,
  },
];

export const WINDOW_DOTS = ['bg-red-400', 'bg-amber-400', 'bg-green-500'] as const;
