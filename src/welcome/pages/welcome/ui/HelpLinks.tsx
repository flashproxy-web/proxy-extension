import { FP_LINKS } from '@/shared/config';
import { Button } from '@/shared/ui/button';

import type { ReactNode } from 'react';

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      asChild
      variant="link"
      className="text-accent h-auto p-0 font-semibold underline-offset-auto"
    >
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Button>
  );
}

export function HelpLinks() {
  return (
    <p className="text-fp-muted2 mt-4.5 text-center text-sm">
      Need help? <ExternalLink href={FP_LINKS.contact}>Contact us</ExternalLink> ·{' '}
      <ExternalLink href={FP_LINKS.docs}>Docs</ExternalLink>
    </p>
  );
}
