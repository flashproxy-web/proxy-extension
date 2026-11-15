import { firstCity, type Model, type PopupState } from '@/popup/entities/connection';
import { COLOR, COMMANDS_IDLE_MAX, SHEET_RESULTS_MAX } from '@/popup/shared/config';
import type { RowSpec } from '@/popup/shared/ui/SheetRow';
import { send } from '@/shared/api/client';
import { COUNTRY_CODES, countryName } from '@/shared/lib/countries';

import { profiles } from './profiles';

interface ActionCommand {
  kind: 'action' | 'profile';
  icon: string;
  title: string;
  keyword: string;
  run: () => void;
}

interface CountryCommand {
  kind: 'country';
  code: string;
  title: string;
  keyword: string;
  run: () => void;
}

type Command = ActionCommand | CountryCommand;

type CommandActions = Pick<PopupState, 'closeSheet' | 'openDash'>;

function actionCommands(model: Model, openDash: PopupState['openDash']): ActionCommand[] {
  const connected = model.on || model.rotating;
  const action = (
    icon: string,
    title: string,
    keyword: string,
    run: () => void
  ): ActionCommand => ({ kind: 'action', icon, title, keyword, run });
  return [
    ...(model.plan && !model.isOwn
      ? [action('refresh-cw', 'Rotate IP', 'rotate', () => send({ type: 'rotate' }))]
      : []),
    action('power', connected ? 'Disconnect' : 'Connect', connected ? 'off' : 'on', () =>
      send({ type: connected ? 'disconnect' : 'connect' })
    ),
    action('arrow-right-left', 'Go direct', 'direct', () =>
      send({ type: 'disconnect', mode: 'direct' })
    ),
    action('git-branch', 'Mode: Smart rules', 'smart', () =>
      send({ type: 'setMode', mode: 'smart' })
    ),
    action('globe', 'Mode: Global', 'global', () => send({ type: 'setMode', mode: 'global' })),
    ...(model.signedIn
      ? [action('layout-dashboard', 'Open dashboard', 'dash', () => openDash())]
      : []),
  ];
}

function profileCommands(model: Model): ActionCommand[] {
  return profiles(model).map((profile) => ({
    kind: 'profile',
    icon: 'server',
    title: 'Use profile: ' + profile.name,
    keyword: 'profile',
    run: profile.pick,
  }));
}

function countryCommands(model: Model): CountryCommand[] {
  const { plan, snapshot } = model;
  if (!plan || model.isOwn) return [];
  const connected = model.on || model.rotating;
  return (plan.countries ?? COUNTRY_CODES).map((code) => ({
    kind: 'country',
    code,
    title: 'Connect to ' + countryName(code),
    keyword: code,
    run: () => {
      send({
        type: 'setLocation',
        location: { cc: code, city: firstCity(snapshot, plan, code), isp: 'any' },
      });
      if (!connected) send({ type: 'connect' });
    },
  }));
}

function matchingCommands(all: Command[], query: string): Command[] {
  if (query) {
    return all.filter(
      (command) => command.title.toLowerCase().includes(query) || command.keyword === query
    );
  }
  return all.filter((command) => command.kind !== 'country').slice(0, COMMANDS_IDLE_MAX);
}

function commandRow(command: Command, highlighted: boolean, run: () => void): RowSpec {
  if (command.kind === 'country') {
    return {
      key: 'c' + command.code,
      title: command.title,
      subtitle: 'Country',
      lead: { flag: command.code },
      trailing: command.code.toUpperCase(),
      selected: highlighted,
      run,
    };
  }
  return {
    key: command.title,
    title: command.title,
    subtitle: command.kind === 'profile' ? 'Profile' : 'Action',
    lead: {
      icon: command.icon,
      background: highlighted ? COLOR.accent : COLOR.panel,
      color: highlighted ? COLOR.onAccent : COLOR.muted,
    },
    trailing: highlighted ? '↵' : '',
    selected: highlighted,
    run,
  };
}

export function commandRows(
  model: Model,
  rawQuery: string,
  { closeSheet, openDash }: CommandActions
): RowSpec[] {
  const query = rawQuery.trim().toLowerCase();
  const all: Command[] = [
    ...actionCommands(model, openDash),
    ...profileCommands(model),
    ...countryCommands(model),
  ];
  return matchingCommands(all, query)
    .slice(0, SHEET_RESULTS_MAX)
    .map((command, index) =>
      commandRow(command, index === 0 && !!query, () => {
        closeSheet();
        command.run();
      })
    );
}
