import type { IspChoice, Mode, PopupUi, SessionType, SiteRule } from '@/shared/model';

export const COLOR = {
  accent: 'var(--accent)',
  accentInk: 'var(--fp-accent-ink)',
  green: 'var(--fp-green)',
  red: 'var(--fp-red)',
  amber: 'var(--fp-amber)',
  muted: 'var(--fp-muted)',
  muted2: 'var(--fp-muted2)',
  panel: 'var(--fp-panel)',
  foreground: 'var(--foreground)',
  onAccent: 'var(--accent-foreground)',
} as const;

export const BRAND_GRADIENT = 'bg-linear-145 from-accent to-fp-accent-hover';
export const EYEBROW = 'text-xs font-semibold tracking-widest uppercase';

export const TOAST_MS = 2400;
export const TOAST_OFFSET_PX = 62;
export const COPIED_MS = 1400;
export const CLOCK_TICK_MS = 1000;
export const SHEET_RESULTS_MAX = 9;
export const COMMANDS_IDLE_MAX = 8;
export const STICKY_RING_RADIUS = 9;
export const STICKY_RING_SIZE = 22;
export const LOW_BANDWIDTH_RATIO = 0.08;

export const OPENING_DASHBOARD = 'Opening dashboard…';
export const OPENING_ADD_PROXY = 'Opening Add proxy…';
export const OPENING_FP_WEB = 'Opening flashproxy.com…';
export const OPENING_SETTINGS = 'Opening settings…';

export const MODES: { value: Mode; label: string; tip: string }[] = [
  { value: 'direct', label: 'Direct', tip: 'No proxy' },
  { value: 'global', label: 'Global', tip: 'Everything through the proxy' },
  { value: 'smart', label: 'Smart', tip: 'Only sites that match your rules' },
  { value: 'system', label: 'System', tip: 'Follow OS proxy settings' },
];

export const LAYOUTS: { value: PopupUi; label: string; tip: string }[] = [
  { value: 'simple', label: 'Simple', tip: 'Just the essentials' },
  { value: 'pro', label: 'Pro', tip: 'Modes, sessions and commands' },
];

export const SESSIONS: { value: SessionType; label: string }[] = [
  { value: 'sticky', label: 'Sticky' },
  { value: 'rotating', label: 'Rotating' },
];

export const SITE_ACTIONS: { rule: SiteRule; label: string }[] = [
  { rule: 'proxy', label: 'Always proxy' },
  { rule: 'direct', label: 'Always direct' },
];

export const ISP_CHOICES: IspChoice[] = ['any', 'isp', 'mob'];

export type AlertTone = 'red' | 'amber';

export const ALERT_TONE: Record<AlertTone, { box: string; color: string }> = {
  red: { box: 'border-fp-red/25 bg-fp-red/6', color: COLOR.red },
  amber: { box: 'border-fp-amber/30 bg-fp-amber/7', color: COLOR.amber },
};

export const TONE_COLOR = {
  ok: COLOR.green,
  busy: COLOR.accent,
  warn: COLOR.amber,
  bad: COLOR.red,
  idle: COLOR.muted2,
} as const;

export const SEG_LIST =
  'grid h-auto w-full items-center gap-0.5 rounded-sm border border-fp-line bg-fp-panel p-0.75';
export const SEG_TRIGGER =
  'h-7 rounded-sm border border-transparent px-2 py-1 text-xs font-semibold text-fp-muted2 hover:bg-transparent hover:text-fp-muted2 dark:text-fp-muted2 data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-none data-[state=on]:ring-1 data-[state=on]:ring-fp-line dark:data-[state=on]:border-transparent dark:data-[state=on]:bg-card dark:data-[state=on]:text-foreground';
export const CHIP_ON = 'border-fp-soft-line! bg-fp-soft! text-fp-accent-ink!';
export const MENU_ROW =
  'menu-btn h-auto w-full justify-start gap-2.5 px-2 py-1.75 text-left font-normal! has-[>svg]:px-2';
export const MENU_HEAD = `px-2 pt-2 pb-1 ${EYEBROW} text-fp-muted2`;
export const SECTION = `px-2 pt-2.5 pb-1 ${EYEBROW} text-fp-muted2`;
export const SHEET_ROW =
  'h-auto cursor-pointer gap-2.5 rounded-sm p-2 data-[selected=true]:bg-fp-panel data-[selected=true]:text-foreground';
