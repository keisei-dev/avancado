const DAY = 24 * 60 * 60 * 1000;

export const STALE_DAYS = 180;

export function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / DAY);
}

export function updatedLabel(date: Date) {
  const days = daysSince(date);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}
