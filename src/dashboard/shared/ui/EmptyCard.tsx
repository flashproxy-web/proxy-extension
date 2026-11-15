import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyCard({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="border-fp-line2 bg-card flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center">
      <span className="bg-fp-soft flex size-13 items-center justify-center rounded-2xl">
        <Icon className="text-accent size-6" />
      </span>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-fp-muted m-0 max-w-120 text-sm leading-relaxed">{text}</p>
      {children}
    </div>
  );
}
