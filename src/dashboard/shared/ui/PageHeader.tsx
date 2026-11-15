import type { ReactNode } from 'react';

export function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-160 min-w-0">
        <h1 className="m-0 text-2xl leading-tight font-semibold tracking-tight">{title}</h1>
        <p className="text-fp-muted mt-1.5 text-sm leading-normal">{sub}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
