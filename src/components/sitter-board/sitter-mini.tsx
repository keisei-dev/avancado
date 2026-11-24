import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/avatar';

export function SitterMini({
  name,
  image,
  verified,
  label,
  stats,
  tone = 'blue',
  action,
}: {
  name: string;
  image: string | null;
  verified: boolean;
  label: string;
  stats: string;
  tone?: 'blue' | 'green';
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-16 border px-4 py-3.5 ${
        tone === 'green' ? 'border-success-line bg-success-soft' : 'border-line bg-ivory'
      }`}
    >
      <Avatar name={name} src={image} size="md" verified={verified} />
      <div className="min-w-0 flex-1">
        <span
          className={`block text-[11px] font-semibold uppercase tracking-[0.08em] ${
            tone === 'green' ? 'text-success' : 'text-olive-dark'
          }`}
        >
          {label}
        </span>
        <strong className="block truncate text-[15px] font-semibold text-brown">{name}</strong>
        <span className="block truncate text-[13px] text-muted">{stats}</span>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
