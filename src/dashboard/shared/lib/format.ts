const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

export function ago(timestamp: number | null): string {
  if (!timestamp) return 'Not tested';
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < MINUTE) return 'Just now';
  if (seconds < HOUR) return `${Math.round(seconds / MINUTE)} min ago`;
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} h ago`;
  return `${Math.round(seconds / DAY)} d ago`;
}

export const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);
