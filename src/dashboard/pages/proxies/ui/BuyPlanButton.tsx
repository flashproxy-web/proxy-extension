import { Plus } from 'lucide-react';

import { FP_LINKS } from '@/shared/config';
import { Button } from '@/shared/ui/button';

export function BuyPlanButton() {
  return (
    <Button asChild>
      <a href={FP_LINKS.plans} target="_blank" rel="noreferrer">
        <Plus />
        Buy a plan
      </a>
    </Button>
  );
}
