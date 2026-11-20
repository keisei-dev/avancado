import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Activity,
  Calendar,
  Check,
  CircleCheck,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smile,
  Frown,
  Star,
  UsersRound,
  X,
} from 'lucide-react';
import { buttonClass } from '@/components/ui/button';
import { ReviewOwnerButton } from '@/components/sitter-board/application-buttons';
import { CancelMatchButton, ReviewSitterButton } from '@/components/sitter-board/owner-actions';
import { SitterMini } from '@/components/sitter-board/sitter-mini';
import { firstName, hoursLabel, statsLine, timeAgo } from '@/lib/sitter-board/format';
import type { getSitterBoard } from '@/app/sitter-board/actions';

type BoardData = NonNullable<Awaited<ReturnType<typeof getSitterBoard>>['data']>;
export type BoardRequest = BoardData['all'][number] | BoardData['mine'][number];
type OwnerRequest = BoardData['mine'][number];
export type SitterStatsMap = BoardData['sitterStats'];

type CardVariant = 'all' | 'mine' | 'applied';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-sage-soft text-olive-dark' },
  MATCHED: { label: 'Matched', className: 'bg-sage-soft text-olive-dark' },
  DONE: { label: 'Done', className: 'bg-success-soft text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-coral-soft text-coral' },
};

export type ApplicationStage = 'APPLIED' | 'MATCHED' | 'DONE';

const STAGE_LABEL: Record<ApplicationStage, { label: string; className: string }> = {
  APPLIED: { label: 'Applied', className: 'bg-sage-soft text-olive-dark' },
  MATCHED: { label: 'Matched', className: 'bg-sage-soft text-olive-dark' },
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

function StatusNote({
  tone,
  icon,
  title,
  text,
  action,
}: {
  tone: 'blue' | 'green' | 'red';
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  const colors = {
    blue: 'border-sky-line bg-sky-soft [&_strong]:text-sky-ink',
    green: 'border-success-line bg-success-soft [&_strong]:text-success',
    red: 'border-coral/30 bg-coral-soft [&_strong]:text-coral',
  }[tone];
  return (
    <div className={`mt-4 flex items-center gap-3 rounded-16 border px-4 py-3 ${colors}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-12 bg-white text-brown-2">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <strong className="block text-[15px] font-semibold">{title}</strong>
        <span className="block truncate text-[13px] text-brown-2" title={text}>
          {text}
        </span>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
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
  sitterStats,
  onChanged,
}: {
  req: BoardRequest;
  variant: CardVariant;
  memberId: string | null;
  sitterStats?: SitterStatsMap;
  onChanged?: (message: string) => void;
}) {
  const start = new Date(req.startAt);
  const end = new Date(req.endAt);
  const sameDay = start.toDateString() === end.toDateString();

  const badgeMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const longDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const dateLabel = sameDay ? longDate(start) : `${longDate(start)} – ${longDate(end)}`;

  const duration = req.durationMinutes ? hoursLabel(req.durationMinutes) : null;

  const isMine = memberId !== null && req.author?.id === memberId;

  // Only My requests data has applicant names
  const ownerApps = variant === 'mine' ? (req as OwnerRequest).applications : [];
  const owner = variant === 'mine';
  const matched = ownerApps.find((a) => a.status === 'ACCEPTED');
  const cancelled =
    req.status === 'OPEN' ? ownerApps.find((a) => a.status === 'REJECTED') : undefined;
  const myReview = req.reviews.find((r) => r.reviewerId === memberId);
  const done = (message: string) => onChanged?.(message);
  const sendMessageClass = buttonClass({
    variant: 'secondary',
    size: 'sm',
    className: 'rounded-12! border-olive! text-olive-dark',
  });
  const reviewProps = matched && {
    requestId: req.id,
    sitter: matched.applicant,
    petName: req.pet?.name ?? 'your pet',
    dateLabel,
    durationLabel: duration ?? '',
    onDone: done,
  };

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
            <span className="font-medium text-brown-2">{badgeMonth}</span>{' '}
            <strong className="text-[15px] font-bold">{start.getDate()}</strong>
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

          <h2 className="text-xl font-display font-semibold tracking-[-0.02em] text-brown mb-1 line-clamp-1">
            {req.title}
          </h2>

          <p className="text-sm text-muted mb-3">
            <span className="font-medium text-brown">{req.pet?.name}</span>
            {req.pet?.breed && ` · ${req.pet.breed}`}
            {isMine
              ? ' · Posted by you'
              : req.author?.name && ` · Posted by ${req.author.name}`}
          </p>

          {req.pet && (
            <span
              className={`mb-4 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                req.pet.isVaccinated ? 'bg-success-soft text-success' : 'bg-amber-soft text-amber-ink'
              }`}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              {req.pet.isVaccinated ? 'Vaccinated' : 'Not vaccinated yet'}
            </span>
          )}

          {variant === 'applied' && (
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
              {req.description.length > 110 ? `${req.description.slice(0, 110)}…` : req.description}
            </p>
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
            {duration && (
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-olive-soft shrink-0" aria-hidden="true" />
                {duration}
              </span>
            )}
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-olive-soft shrink-0" aria-hidden="true" />
              {req.areaName}
            </span>
          </div>

          {owner && cancelled && (
            <StatusNote
              tone="red"
              icon={<X size={16} aria-hidden="true" />}
              title={`Match with ${firstName(cancelled.applicant.name)} was cancelled`}
              text="Your request is open again. Choose another applicant."
            />
          )}
          {owner && req.status === 'MATCHED' && matched && (
            <div className="mt-4">
              <SitterMini
                name={matched.applicant.name}
                image={matched.applicant.image}
                verified={matched.applicant.isVerified}
                label="Selected sitter"
                stats={statsLine(sitterStats?.[matched.applicantId])}
                action={
                  <Link href="/messages" className={sendMessageClass}>
                    <MessageCircle size={14} aria-hidden="true" />
                    Send message
                  </Link>
                }
              />
            </div>
          )}
          {owner && req.status === 'DONE' && matched && reviewProps && (
            <div className="mt-4">
              <SitterMini
                tone="green"
                name={matched.applicant.name}
                image={matched.applicant.image}
                verified={matched.applicant.isVerified}
                label="Completed with"
                stats={statsLine(sitterStats?.[matched.applicantId])}
                action={
                  myReview ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-dark">
                      <Star size={15} className="text-star" fill="currentColor" aria-hidden="true" />
                      You rated {myReview.rating}
                    </span>
                  ) : (
                    <ReviewSitterButton {...reviewProps} label="Review" />
                  )
                }
              />
            </div>
          )}
          {stage === 'APPLIED' && (
            <StatusNote
              tone="blue"
              icon={<UsersRound size={16} aria-hidden="true" />}
              title="Application sent"
              text="The owner will select the applicant."
            />
          )}
          {stage === 'MATCHED' && (
            <StatusNote
              tone="blue"
              icon={<UsersRound size={16} aria-hidden="true" />}
              title="Matched with a neighbour"
              text="You can chat with the owner in Messages."
              action={
                <Link href="/messages" className={buttonClass({ variant: 'primary', size: 'sm' })}>
                  <Check size={14} aria-hidden="true" />
                  Send message
                </Link>
              }
            />
          )}
          {stage === 'DONE' && (
            <StatusNote
              tone="green"
              icon={<CircleCheck size={16} aria-hidden="true" />}
              title="Care completed"
              text={
                myReview
                  ? 'Thanks for reviewing this sitting.'
                  : 'This request is ready for mutual reviews.'
              }
              action={
                myReview ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                    {myReview.rating >= 4 ? (
                      <Smile size={16} aria-hidden="true" />
                    ) : (
                      <Frown size={16} aria-hidden="true" />
                    )}
                    Reviewed
                  </span>
                ) : (
                  <ReviewOwnerButton
                    requestId={req.id}
                    petName={req.pet?.name ?? 'the pet'}
                    ownerName={req.author?.name ?? 'the owner'}
                    onDone={done}
                  />
                )
              }
            />
          )}
        </div>
      </div>

      <div className="mx-5 py-4 border-t border-line flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted">
          {(variant !== 'applied' || stage === 'DONE') && (
            <>
              <strong className="text-brown">{req.applications.length}</strong>{' '}
              {req.applications.length === 1 ? 'applicant' : 'applicants'}
            </>
          )}
        </span>
        <div className="flex gap-2">
          {owner && req.status === 'OPEN' && (
            <Link
              href={`/sitter-board/${req.id}#applicants`}
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

      {owner && req.status === 'MATCHED' && matched && reviewProps && (
        <div className="mx-5 mb-5 grid grid-cols-2 gap-2.5">
          <CancelMatchButton requestId={req.id} sitterName={matched.applicant.name} onDone={done} />
          <ReviewSitterButton {...reviewProps} label="Mark done" className="w-full" />
        </div>
      )}
    </div>
  );
}
