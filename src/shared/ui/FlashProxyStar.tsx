import { cn } from '../lib/utils';

const STAR_URL = '/icons/fp-star.png';

export function FlashProxyStar({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <img src={STAR_URL} alt="" width={size} height={size} className={cn('block', className)} />
  );
}
