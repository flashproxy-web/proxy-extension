import type { Model, PopupState } from '@/popup/entities/connection';
import type { AlertTone } from '@/popup/shared/config';
import { send } from '@/shared/api/client';
import { fmtDay } from '@/shared/lib/format';

interface AlertAction {
  label: string;
  run: () => void;
  primary?: boolean;
}

export interface AlertSpec {
  title: string;
  description: string;
  tone: AlertTone;
  icon: string;
  actions: AlertAction[];
}

type AlertActions = Pick<PopupState, 'setUi' | 'openSheet' | 'openAddProxy'>;

type WebPage = 'topup' | 'renew' | 'plans';

const openWeb = (page: WebPage) => () => send({ type: 'open', target: { kind: 'web', page } });

const pickOwn = (proxyId: string) => () => send({ type: 'pickOwn', proxyId });

const GO_DIRECT: AlertAction = {
  label: 'Go direct',
  run: () => send({ type: 'disconnect', mode: 'direct' }),
};

const RETRY: AlertAction = { label: 'Retry', run: () => send({ type: 'connect' }), primary: true };

export function alertFor(
  model: Model,
  { setUi, openSheet, openAddProxy }: AlertActions
): AlertSpec | undefined {
  const { snapshot } = model;
  const switchProfile: AlertAction = {
    label: 'Switch profile',
    run: () => openSheet(model.isOwn ? 'own' : 'prof'),
  };
  const firstHealthyOwn =
    snapshot.ownProxies.find((proxy) => proxy.healthy) ?? snapshot.ownProxies[0];

  switch (model.status) {
    case 'auth':
      return {
        title: 'Proxy authentication failed',
        description: 'The gateway rejected the username or password for this profile.',
        tone: 'red',
        icon: 'shield-alert',
        actions: [RETRY, switchProfile, GO_DIRECT],
      };
    case 'unreach':
      return {
        title: 'Proxy unreachable',
        description: `${model.host} did not answer within 10 seconds.`,
        tone: 'red',
        icon: 'wifi-off',
        actions: [RETRY, switchProfile, GO_DIRECT],
      };
    case 'bw':
      return {
        title: "You're out of bandwidth",
        description: `${model.plan?.name ?? 'This plan'} has 0 GB left. Top up to keep browsing through FlashProxy.`,
        tone: 'amber',
        icon: 'gauge',
        actions: firstHealthyOwn
          ? [
              { label: 'Switch to my proxy', run: pickOwn(firstHealthyOwn.id), primary: true },
              { label: 'Top up', run: openWeb('topup') },
              GO_DIRECT,
            ]
          : [{ label: 'Top up', run: openWeb('topup'), primary: true }, switchProfile, GO_DIRECT],
      };
    case 'noplans':
      return {
        title: 'No active plans',
        description: 'This account has no active FlashProxy plans yet.',
        tone: 'amber',
        icon: 'package-open',
        actions: [
          { label: 'Buy a plan', run: openWeb('plans'), primary: true },
          {
            label: 'Use my own proxies',
            run: firstHealthyOwn ? pickOwn(firstHealthyOwn.id) : openAddProxy,
          },
        ],
      };
    case 'expired':
      return {
        title: `Your ${model.plan?.name ?? ''} plan expired on ${fmtDay(model.plan?.expiredAt)}`,
        description: 'Renew to keep the same targeting, or switch to another plan or proxy.',
        tone: 'amber',
        icon: 'calendar-x',
        actions: [
          { label: 'Renew', run: openWeb('renew'), primary: true },
          { label: 'Switch source', run: () => setUi({ srcOpen: true, sheet: null }) },
        ],
      };
    case 'ownfail':
      return {
        title: `${model.proxy?.label ?? 'Proxy'} failed its health check`,
        description: `${model.host} did not answer the last 3 checks.`,
        tone: 'red',
        icon: 'heart-crack',
        actions: [
          { label: 'Use another proxy', run: () => openSheet('own'), primary: true },
          GO_DIRECT,
        ],
      };
    case 'conflict':
      return {
        title: 'Another extension took over',
        description: snapshot.runtime.conflictName
          ? `“${snapshot.runtime.conflictName}” changed the proxy setting, so FlashProxy is paused.`
          : 'Another extension changed the proxy setting, so FlashProxy is paused.',
        tone: 'amber',
        icon: 'puzzle',
        actions: [
          { label: 'Take back control', run: () => send({ type: 'takeBack' }), primary: true },
          {
            label: 'Manage extensions',
            run: () => send({ type: 'open', target: { kind: 'extensions' } }),
          },
        ],
      };
    default:
      return undefined;
  }
}
