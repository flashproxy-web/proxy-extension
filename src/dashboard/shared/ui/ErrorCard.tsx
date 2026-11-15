import { RotateCw, TriangleAlert } from 'lucide-react';

import { PRODUCT_NAME, VERSION } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

import { WORKER_ERROR_CODE } from '../config';

export function ErrorCard({ retry }: { retry: () => void }) {
  return (
    <Card className="fp-card items-center gap-3 px-6 py-12 text-center">
      <span className="bg-fp-red/10 flex size-12 items-center justify-center rounded-xl">
        <TriangleAlert className="text-fp-red size-5.5" />
      </span>
      <div className="text-lg font-semibold tracking-tight">Couldn’t unlock your proxy library</div>
      <p className="text-fp-muted m-0 max-w-110 text-sm leading-relaxed">
        The extension’s background worker didn’t answer. Nothing was lost.
      </p>
      <code className="border-fp-line bg-fp-panel text-fp-muted2 rounded-md border px-2 py-0.5 text-xs">
        {WORKER_ERROR_CODE}
      </code>
      <div className="mt-1.5 flex gap-2">
        <Button onClick={retry}>
          <RotateCw />
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void navigator.clipboard.writeText(`${PRODUCT_NAME} ${VERSION} · ${WORKER_ERROR_CODE}`)
          }
        >
          Copy error details
        </Button>
      </div>
    </Card>
  );
}
