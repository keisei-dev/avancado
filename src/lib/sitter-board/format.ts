import type { SitterStats } from '@/lib/sitter-board/stats';

export function timeAgo(date: Date) {
  const now = new Date();
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}

// "24 completed sits · 4.9 stars"
export function statsLine(stats: SitterStats | undefined) {
  const s = stats ?? { sits: 0, rating: null, reviews: 0 };
  const sits = `${s.sits} completed sit${s.sits === 1 ? '' : 's'}`;
  return s.rating === null ? sits : `${sits} · ${s.rating} stars`;
}

// 120 -> "2 hours", 90 -> "1.5 hours"
export function hoursLabel(minutes: number) {
  const hours = Number((minutes / 60).toFixed(1));
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}
