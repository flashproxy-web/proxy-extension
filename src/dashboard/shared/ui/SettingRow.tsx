import type { ReactNode } from 'react';

export function SettingRow({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="border-fp-line border-t">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div className="min-w-60 flex-[1_1_18rem]">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-fp-muted mt-0.5 text-sm leading-normal">{description}</div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
      </div>
      {footer ? <div className="text-fp-muted2 -mt-1.5 px-5 pb-4 text-xs">{footer}</div> : null}
    </div>
  );
}
