// Pure derivations for the Simple popup: its one-line problems, the power button's
// look, and which Pro-only setting (if any) it has to point at.

import type { ActiveTab, HeroAnimation, Model } from '@/popup/entities/connection';
import type { AlertTone } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { fmtDay } from '@/shared/lib/format';
import { routeFor, siteKey } from '@/shared/lib/routing';
import type { SiteRule } from '@/shared/model';
import type { StatusTone } from '@/shared/ui/StatusDot';

export interface SimpleProblem {
  tone: AlertTone;
  icon: string;
  text: string;
  label: string;
  run: () => void;
}

type WebPage = 'topup' | 'renew' | 'plans';

const retry = () => send({ type: 'connect' });

const openWeb = (page: WebPage) => () => send({ type: 'open', target: { kind: 'web', page } });

/** One plain sentence and one fix per problem. The power button runs the same fix. */
export function simpleProblem(model: Model, openVia: () => void): SimpleProblem | undefined {
  const plan = model.plan?.name ?? 'FlashProxy';
  switch (model.status) {
    case 'auth':
      return {
        tone: 'red',
        icon: 'shield-alert',
        text: 'The proxy rejected your login details.',
        label: 'Try again',
        run: retry,
      };
    case 'unreach':
      return {
        tone: 'red',
        icon: 'wifi-off',
        text: 'The proxy isn’t responding right now.',
        label: 'Try again',
        run: retry,
      };
    case 'conflict':
      return {
        tone: 'amber',
        icon: 'puzzle',
        text: 'Another extension is controlling your proxy setting.',
        label: 'Take back control',
        run: () => send({ type: 'takeBack' }),
      };
    case 'ownfail':
      return {
        tone: 'red',
        icon: 'heart-crack',
        text: `${model.proxy?.label ?? 'Your proxy'} stopped responding.`,
        label: 'Choose another',
        run: openVia,
      };
    case 'bw':
      return {
        tone: 'amber',
        icon: 'gauge',
        text: `Your ${plan} plan is out of data.`,
        label: 'Buy more data',
        run: openWeb('topup'),
      };
    case 'expired':
      return {
        tone: 'amber',
        icon: 'calendar-x',
        text: `Your ${plan} plan expired on ${fmtDay(model.plan?.expiredAt)}.`,
        label: 'Renew plan',
        run: openWeb('renew'),
      };
    case 'noplans':
      return {
        tone: 'amber',
        icon: 'package-open',
        text: 'You don’t have an active FlashProxy plan yet.',
        label: 'Buy a plan',
        run: openWeb('plans'),
      };
    default:
      return undefined;
  }
}

interface SimpleStatus {
  label: string;
  color: string;
  tone: StatusTone;
  animation: HeroAnimation;
}

export function simpleStatus(model: Model, problem: SimpleProblem | undefined): SimpleStatus {
  if (problem) {
    const red = problem.tone === 'red';
    return {
      label: 'Problem',
      color: red ? 'var(--fp-red)' : 'var(--fp-amber)',
      tone: red ? 'bad' : 'warn',
      animation: 'none',
    };
  }
  if (model.connecting) {
    return { label: 'Connecting', color: 'var(--fp-accent-ink)', tone: 'busy', animation: 'blink' };
  }
  if (model.on || model.rotating) {
    return { label: 'Connected', color: 'var(--fp-green)', tone: 'ok', animation: 'pulse' };
  }
  return { label: 'Off', color: 'var(--fp-muted2)', tone: 'idle', animation: 'none' };
}

export type PowerLook = AlertTone | 'connecting' | 'on' | 'off';

export function powerLook(model: Model, problem: SimpleProblem | undefined): PowerLook {
  if (problem) return problem.tone;
  if (model.connecting) return 'connecting';
  return model.on || model.rotating ? 'on' : 'off';
}

export function powerAction(
  model: Model,
  problem: SimpleProblem | undefined
): { hint: string; run: () => void } {
  if (problem) return { hint: problem.label, run: problem.run };
  if (model.connecting) return { hint: 'Cancel', run: () => send({ type: 'disconnect' }) };
  if (model.on || model.rotating) {
    return { hint: 'Turn off', run: () => send({ type: 'disconnect' }) };
  }
  return { hint: 'Turn on', run: retry };
}

export interface SimpleDestination {
  flagCc: string | null;
  title: string;
  via: string;
}

export function simpleDestination(model: Model): SimpleDestination {
  if (model.status === 'noplans') {
    return { flagCc: null, title: 'No location yet', via: model.isOwn ? model.providerName : '' };
  }
  if (model.isOwn) {
    return { flagCc: model.exitCc, title: model.proxy?.label ?? '', via: model.providerName };
  }
  return { flagCc: model.location.cc, title: model.placeTitle, via: model.plan?.name ?? '' };
}

export function simpleNote(model: Model, problem: SimpleProblem | undefined): string {
  if (model.connecting) return 'Finding the best exit…';
  if (problem) {
    if (model.isOwn) return `${model.providerName} · ${model.host}`;
    return model.plan ? model.plan.name + ' plan' : '';
  }
  const realIp = model.snapshot.runtime.realIp;
  return realIp ? `Your real IP ${realIp} is visible` : 'Your real IP is visible';
}

/** A setting only Pro can change, shown in Simple as a chip that opens Pro. */
export function proOnlySetting(model: Model): { icon: string; label: string } | null {
  const { settings } = model.snapshot;
  if (settings.mode === 'smart') return { icon: 'git-branch', label: 'Smart rules on' };
  if (settings.mode === 'system') return { icon: 'monitor', label: 'System proxy on' };
  if (!model.isOwn && settings.session === 'rotating') {
    return { icon: 'refresh-cw', label: 'Rotating IPs on' };
  }
  return null;
}

export interface SiteSwitch {
  site: string | null;
  on: boolean;
  subtitle: string;
  next: SiteRule | null;
}

function siteSwitchSubtitle(site: string | null, connected: boolean, on: boolean): string {
  if (!site) return 'Open a website to use this';
  if (!connected) return `${site} · applies when you’re connected`;
  return on ? `${site} goes through the proxy` : `${site} connects directly`;
}

/**
 * The "Use proxy on this site" switch. It shows whether the site uses the proxy once
 * connected (Direct and System connect as Global), and writes the same site rule as
 * Pro's Always proxy / Always direct.
 */
export function siteSwitch(model: Model, tab: ActiveTab | null): SiteSwitch {
  const { settings, rules } = model.snapshot;
  const site = tab ? siteKey(tab.host) : null;
  const mode = settings.mode === 'smart' ? 'smart' : 'global';
  const on = !!(site && tab && routeFor(new URL(tab.url), mode, settings.siteRules, rules).proxied);
  const subtitle = siteSwitchSubtitle(site, model.on || model.rotating, on);
  // Turning it on in Global just drops an "always direct" rule; anywhere else it adds "always proxy".
  const dropsDirectRule = mode === 'global' && !!site && settings.siteRules[site] === 'direct';
  const next = on ? 'direct' : dropsDirectRule ? null : 'proxy';
  return { site, on, subtitle, next };
}
