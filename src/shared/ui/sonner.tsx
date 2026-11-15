import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { cn } from '../lib/utils';

const Toaster = ({ className, theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      position="top-right"
      closeButton
      duration={4500}
      offset={16}
      gap={12}
      visibleToasts={5}
      className={cn('toaster group', className)}
      mobileOffset={{
        top: 'max(1rem, env(safe-area-inset-top))',
      }}
      // State glyphs, drawn white on the colour fill (the loading spinner is a
      // muted grey on the Ink surface). Colour lives in the .fp-toast* named CSS,
      // not on these nodes.
      icons={{
        success: <CheckCircle2 className="size-[18px]" aria-hidden />,
        error: <XCircle className="size-[18px]" aria-hidden />,
        info: <Info className="size-[18px]" aria-hidden />,
        warning: <AlertTriangle className="size-[18px]" aria-hidden />,
        loading: <Loader2 className="size-[18px] animate-spin" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          // Filled toast — Adobe Spectrum "A Soft": a solid per-type colour fill,
          // white text, a chosen 10px radius. None of the old glass card's
          // left-bar / pale-tint / gradient-chip / blur (those read as an
          // auto-generated-dashboard default). All visual — fill, text colour,
          // action, close, icon — lives in the .fp-toast* named CSS in
          // dashboard.css: arbitrary Tailwind colour/gradient classes drop out of
          // the prod Turbopack build across Sonner's DOM boundary. Keep ONLY
          // layout (flex / gap / radius / padding) here.
          toast: cn(
            'fp-toast group/toast relative flex items-center gap-3',
            'rounded-[10px] py-[13px] pe-[42px] ps-[14px]'
          ),
          content: 'relative flex min-w-0 flex-1 flex-col gap-0.5',
          icon: 'fp-toast-icon',
          // Sonner injects `.sonner-loader { position:absolute; transform }`; in
          // unstyled mode force it back into normal flow beside the text.
          loader: cn(
            'fp-toast-icon',
            '!relative !top-auto !left-auto !translate-x-0 !translate-y-0 !transform-none'
          ),
          // Size / leading / weight only — text COLOUR is pinned white in the
          // named CSS (see the .fp-toast [data-title]/[data-description] notes in
          // dashboard.css for why it can't live on Tailwind classes).
          title: 'text-[13.5px] leading-tight font-semibold',
          description: 'text-[12.5px] leading-snug font-medium',
          // Inline text action ("Retry" / "View cart") — a white underline, not a
          // pill. Styled via [data-button][data-action] in the named CSS; this
          // marker just keeps it greppable.
          actionButton: 'fp-toast-action',
          cancelButton: 'fp-toast-cancel',
          // Styled in the .fp-toast [data-close-button] named CSS, matched on the
          // data attribute so it wins over Sonner's own ungated close rules.
          closeButton: 'fp-toast-close',
          // Per-type: set --fp-accent (the fill). `loading` swaps to the Ink surface.
          success: 'fp-toast-success',
          error: 'fp-toast-error',
          info: 'fp-toast-info',
          warning: 'fp-toast-warning',
          loading: 'fp-toast-loading',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
