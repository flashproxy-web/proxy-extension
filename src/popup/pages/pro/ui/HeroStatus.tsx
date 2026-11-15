import { HeroDot, hero, usePopup } from '@/popup/entities/connection';
import { EYEBROW } from '@/popup/shared/config';
import { cn } from '@/shared/lib/utils';

export function HeroStatus() {
  const { model } = usePopup();
  const { label, color, tone, animation, title, subtitle } = hero(model);
  return (
    <div className="min-w-0 flex-1">
      <div className={cn('eyebrow flex items-center gap-1.75', EYEBROW)} style={{ color }}>
        <HeroDot tone={tone} animation={animation} />
        {label}
      </div>
      <div className="hero-title mt-1.25 truncate text-xl font-bold tracking-tight">{title}</div>
      <div className="hero-sub text-fp-muted2 mt-0.5 truncate text-xs">{subtitle}</div>
    </div>
  );
}
