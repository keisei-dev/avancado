import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Activity, MapPin, ShieldCheck } from 'lucide-react';
import { buttonClass } from '@/components/ui/button';
import { timeAgo } from '@/lib/sitter-board/format';
import type { getSitterBoard } from '@/app/sitter-board/actions';

export type BoardRequest = NonNullable<
  Awaited<ReturnType<typeof getSitterBoard>>['data']
>['all'][number];

type CardVariant = 'all' | 'mine' | 'applied';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-sage-soft text-olive-dark' },
  MATCHED: { label: 'Matched', className: 'bg-sky-soft text-sky-ink' },
  DONE: { label: 'Done', className: 'bg-cream text-brown-2' },
  CANCELLED: { label: 'Cancelled', className: 'bg-coral-soft text-coral' },
};

export type ApplicationStage = 'APPLIED' | 'MATCHED' | 'DONE';

const STAGE_LABEL: Record<ApplicationStage, { label: string; className: string }> = {
  APPLIED: { label: 'Applied', className: 'bg-sky-soft text-sky-ink' },
  MATCHED: { label: 'Matched', className: 'bg-sky-soft text-sky-ink' },
  DONE: { label: 'Done', className: 'bg-success-soft text-success' },
};

// My application status for the Applied tab
export function applicationStage(
  req: BoardRequest,
  memberId: string | null,
): ApplicationStage | null {
  const app = memberId ? req.applications.find((a) => a.applicantId === memberId) : undefined;
  if (!app) return null;
  if (app.status === 'ACCEPTED') {
    if (req.status === 'DONE') return 'DONE';
    if (req.status === 'MATCHED') return 'MATCHED';
    return null;
  }
  if (app.status === 'PENDING' && req.status === 'OPEN') return 'APPLIED';
  return null;
}

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

export function RequestCard({
  req,
  variant,
  memberId,
}: {
  req: BoardRequest;
  variant: CardVariant;
  memberId: string | null;
}) {
  const start = new Date(req.startAt);
  const end = new Date(req.endAt);
  const sameDay = start.toDateString() === end.toDateString();

  const badgeDate = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const longDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const dateLabel = sameDay ? longDate(start) : `${longDate(start)} – ${longDate(end)}`;

  const durationHours = req.durationMinutes
    ? (req.durationMinutes / 60).toFixed(1).replace('.0', '')
    : null;

  const isMine = memberId !== null && req.author?.id === memberId;

  const stage = variant === 'applied' ? applicationStage(req, memberId) : null;
  const status = variant === 'applied' ? (stage ? STAGE_LABEL[stage] : null) : STATUS_LABEL[req.status];

  return (
    <div className="bg-white rounded-2xl border border-line shadow-card overflow-hidden flex flex-col justify-between hover:shadow-raised transition-shadow">
      <div>
        <div className="relative w-full h-52 bg-ivory">
          {req.pet?.imageUrl ? (
            <Image
              src={req.pet.imageUrl}
              alt={req.pet.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-sm">
              No Pet Image
            </div>
          )}
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brown text-xs font-semibold px-3 py-1.5 rounded-full shadow-card">
            {badgeDate}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              {status && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}
                >
                  {status.label}
                </span>
              )}
            </div>
            <span className="text-xs text-muted shrink-0">
              {timeAgo(new Date(req.createdAt))}
            </span>
          </div>

          <h2 className="text-xl font-display font-bold text-brown mb-1 line-clamp-1">
            {req.title}
          </h2>

          <p className="text-sm text-muted mb-3">
            <span className="font-medium text-brown">{req.pet?.name}</span>
            {req.pet?.breed && ` · ${req.pet.breed}`}
            {isMine
              ? ' · Posted by you'
              : req.author?.name && ` · Posted by ${req.author.name}`}
          </p>

          {req.pet?.isVaccinated && (
            <span className="mb-4 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-soft text-success">
              <ShieldCheck size={14} aria-hidden="true" />
              Vaccinated
            </span>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-brown-2 pt-1">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-olive-soft shrink-0" aria-hidden="true" />
              {dateLabel}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-olive-soft shrink-0" aria-hidden="true" />
              {start.toLocaleTimeString('en-US', timeFormat)} –{' '}
              {end.toLocaleTimeString('en-US', timeFormat)}
            </span>
            {durationHours && (
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-olive-soft shrink-0" aria-hidden="true" />
                {durationHours} hours
              </span>
            )}
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-olive-soft shrink-0" aria-hidden="true" />
              {req.areaName}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-5 py-4 border-t border-line flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted">
          <strong className="text-brown">{req.applications.length}</strong>{' '}
          {req.applications.length === 1 ? 'applicant' : 'applicants'}
        </span>
        <div className="flex gap-2">
          {variant === 'mine' && (
            <Link
              href={`/sitter-board/my-requests/${req.id}`}
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              View applicants
            </Link>
          )}
          <Link
            href={`/sitter-board/${req.id}`}
            className={buttonClass({ variant: 'secondary', size: 'sm' })}
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
