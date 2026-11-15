import type { SignIn } from '@/shared/model';

export const STAGE_COPY: Record<SignIn['stage'], { title: string; description: string }> = {
  enter: {
    title: 'Add your FlashProxy API key',
    description: 'The extension reads your plans and creates proxy logins with it.',
  },
  load: { title: 'You’re signed in', description: 'Loading your plans…' },
};

export const ACTION_BUTTON = 'h-10 w-full text-sm font-semibold!';
export const SECONDARY_ACTION_BUTTON = `${ACTION_BUTTON} text-fp-muted`;
