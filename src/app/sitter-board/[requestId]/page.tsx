import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  CircleCheck,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { ApplicantList } from '@/components/sitter-board/applicant-list';
import { ApplicationAction } from '@/components/sitter-board/application-buttons';
import { DeleteRequestButton } from '@/components/sitter-board/owner-actions';
import { ReportRequestButton } from '@/components/sitter-board/report-request-button';
import { SitterMini } from '@/components/sitter-board/sitter-mini';
import { firstName, hoursLabel, statsLine, timeAgo } from '@/lib/sitter-board/format';
import { getSitterStats } from '@/lib/sitter-board/stats';
import { Avatar } from '@/components/ui/avatar';
import { buttonClass } from '@/components/ui/button';
import { getCurrentMember, isAdminMember } from '@/lib/auth/member';
import { getSitterRequestDetail } from './actions';

export const instant = false;

interface PageProps {
  params: Promise<{ requestId: string }>;
}

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

// DOG -> Dog
function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function AsideStatus({ children }: { children: string }) {
  return (
    <p className="rounded-12 bg-ivory px-4 py-3.5 text-center text-sm font-semibold text-muted">
      {children}
    </p>
  );
}

function petAge(birthDate: Date | null) {
  if (!birthDate) return 'N/A';
  const years = Math.floor(
    (new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600 * 1000),
  );
  return years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : 'Less than a year';
}

export default async function SitterDetailPage({ params }: PageProps) {
  await connection();

  const { requestId } = await params;

  const [result, member] = await Promise.all([
    getSitterRequestDetail(requestId),
    getCurrentMember(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-coral">
        {result.error || 'An error occurred while loading the details.'}
      </div>
    );
  }

  const req = result.data;
  const pet = req.pet;
  const isAdmin = member ? isAdminMember(member) : false;
  const isMine = member?.id === req.authorId;

  const start = new Date(req.startAt);
  const end = new Date(req.endAt);
  const sameDay = start.toDateString() === end.toDateString();
  const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const longDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const dateParts = sameDay ? [longDate(start)] : [`${longDate(start)} –`, longDate(end)];
  const applicantCount = req.applications.length;
  const myApplication = member
    ? req.applications.find((a) => a.applicantId === member.id)
    : undefined;

  const stats = isMine ? await getSitterStats(req.applications.map((a) => a.applicantId)) : {};
  const matched = req.applications.find((a) => a.status === 'ACCEPTED');
  const sendMessageClass = buttonClass({
    variant: 'secondary',
    size: 'sm',
    className: 'rounded-12! border-olive! text-olive-dark',
  });

  const applicants = req.applications.map((a) => ({
    id: a.id,
    userId: a.applicant.id,
    name: a.applicant.name,
    image: a.applicant.image,
    isVerified: a.applicant.isVerified,
    message: a.message,
    appliedLabel: `Applied ${shortDate(a.createdAt)}`,
    cancelled: a.status === 'REJECTED',
    stats: stats[a.applicantId],
  }));

  const startTime = start.toLocaleTimeString('en-US', timeFormat);
  const endTime = end.toLocaleTimeString('en-US', timeFormat);
  const when = sameDay
    ? `${longDate(start)} from ${startTime} – ${endTime}`
    : `from ${longDate(start)}, ${startTime} to ${longDate(end)}, ${endTime}`;

  const closedText =
    myApplication?.status === 'REJECTED'
      ? 'Your application was not selected'
      : req.status === 'DONE'
      ? 'This sitting is complete'
      : req.status === 'CANCELLED'
        ? 'This request was cancelled'
        : 'This request has been matched';

  const facts = [
    { icon: Calendar, label: 'Date', parts: dateParts },
    {
      icon: Clock,
      label: 'Time',
      parts: [`${startTime} –`, endTime],
    },
    { icon: Activity, label: 'Duration', parts: [req.durationMinutes ? hoursLabel(req.durationMinutes) : 'N/A'] },
    { icon: MapPin, label: 'Location', parts: [req.areaName] },
  ];

  const petFacts = [
    pet.gender !== 'UNKNOWN' ? titleCase(pet.gender) : null,
    pet.isNeutered ? (pet.gender === 'FEMALE' ? 'Spayed' : 'Neutered') : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-7 py-12">
      <Link
        href="/sitter-board"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brown-2 hover:text-brown transition-colors"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Back to sitter board
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="min-w-0">
        {/* Main card */}
        <article className="bg-white rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="relative w-full h-[360px] bg-ivory">
            {pet.imageUrl ? (
              <Image
                src={pet.imageUrl}
                alt={pet.name}
                fill
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                No Pet Image
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-olive-dark">
                <Heart size={13} aria-hidden="true" />
                Community help request
              </span>
              <span className="text-xs text-muted">Posted {timeAgo(new Date(req.createdAt))}</span>
            </div>

            <h1 className="text-[30px] font-display font-bold tracking-[-0.02em] leading-[1.2] text-brown mb-6">
              {req.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {facts.map(({ icon: Icon, label, parts }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-16 bg-ivory px-3 py-3">
                  <Icon size={18} className="shrink-0 text-olive" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="block text-sm font-semibold leading-snug text-brown">
                      {parts.map((part, i) => (
                        <span key={i} className="whitespace-nowrap">
                          {i > 0 && ' '}
                          {part}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-display font-bold text-brown mb-2">
              About the care request
            </h2>
            <p className="text-[15px] text-brown-2 whitespace-pre-line leading-relaxed mb-8">
              {req.description}
            </p>

            {isMine && req.status === 'MATCHED' && matched && (
              <div className="mb-6">
                <SitterMini
                  name={matched.applicant.name}
                  image={matched.applicant.image}
                  verified={matched.applicant.isVerified}
                  label="Selected sitter"
                  stats={statsLine(stats[matched.applicantId])}
                  action={
                    <Link href="/messages" className={sendMessageClass}>
                      <MessageCircle size={14} aria-hidden="true" />
                      Send message
                    </Link>
                  }
                />
              </div>
            )}

            {isAdmin || (isMine && req.status === 'CANCELLED') ? null : isMine ? (
              <DeleteRequestButton
                requestId={req.id}
                title={req.title}
                applicantCount={applicantCount}
              />
            ) : (
              <ReportRequestButton
                requestId={req.id}
                signedIn={Boolean(member)}
                isOwn={isMine}
              />
            )}
          </div>
        </article>

        {isMine && (
          <ApplicantList
            open={req.status === 'OPEN'}
            requestId={req.id}
            petName={pet.name}
            dateLabel={dateParts.join(' ')}
            applicants={applicants}
          />
        )}
        </div>

        {/* Pet + action card */}
        <aside className="bg-white rounded-2xl border border-line shadow-card p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-4 pb-5 border-b border-line">
            <div className="relative size-[72px] shrink-0 rounded-16 overflow-hidden bg-ivory">
              {pet.imageUrl && (
                <Image src={pet.imageUrl} alt="" fill sizes="72px" className="object-cover" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Meet
              </span>
              <h2 className="text-[22px] font-display font-bold text-brown leading-tight">
                {pet.name}
              </h2>
              <p className="text-sm text-brown-2">{titleCase(pet.species)}</p>
            </div>
          </div>

          <dl className="text-sm mb-4">
            <div className="flex items-center justify-between py-3 border-b border-line">
              <dt className="text-muted">Breed</dt>
              <dd className="font-semibold text-brown">{pet.breed || 'N/A'}</dd>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-line">
              <dt className="text-muted">Age</dt>
              <dd className="font-semibold text-brown">{petAge(pet.birthDate)}</dd>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-line">
              <dt className="text-muted">Weight</dt>
              <dd className="font-semibold text-brown">
                {pet.weight ? `${Number(pet.weight)} kg` : 'N/A'}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-line">
              <dt className="text-muted">Vaccinated</dt>
              <dd>
                {pet.isVaccinated ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-soft text-success">
                    <ShieldCheck size={14} aria-hidden="true" />
                    Vaccinated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-soft text-amber-ink">
                    <ShieldCheck size={14} aria-hidden="true" />
                    Not vaccinated yet
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted">Applicants</dt>
              <dd className="font-semibold text-brown">
                {applicantCount} {applicantCount === 1 ? 'neighbour' : 'neighbours'}
              </dd>
            </div>
          </dl>

          <div className="rounded-2xl border border-sage bg-sage-faint p-4 mb-4">
            <h3 className="text-base font-display font-semibold text-brown mb-1">About {pet.name}</h3>
            {petFacts.length > 0 && (
              <p className="text-[13px] font-semibold text-olive-dark mb-2">{petFacts.join(' · ')}</p>
            )}
            <p className="text-sm text-brown-2 leading-relaxed">
              {pet.notes ||
                (isMine
                  ? "You haven't added care notes yet."
                  : `${req.author.name} hasn't added care notes yet.`)}
            </p>
          </div>

          <Link
            href={`/profile/${req.author.id}`}
            className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3 mb-4 hover:border-beige transition-colors"
          >
            <Avatar name={req.author.name} src={req.author.image} size="md" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-muted">Posted by</span>
              <span className="block font-semibold text-brown truncate">
                {req.author.name}
                {isMine && ' (you)'}
              </span>
            </div>
            <ChevronRight size={18} className="text-muted" aria-hidden="true" />
          </Link>

          {isAdmin ? null : isMine && req.status === 'OPEN' ? (
            <a
              href="#applicants"
              className={buttonClass({ variant: 'primary', size: 'md', className: 'w-full' })}
            >
              Review applicants ({applicantCount})
            </a>
          ) : isMine && req.status === 'MATCHED' && matched ? (
            <Link
              href="/messages"
              className={buttonClass({ variant: 'primary', size: 'md', className: 'w-full' })}
            >
              <MessageCircle size={17} aria-hidden="true" />
              Message {firstName(matched.applicant.name)}
            </Link>
          ) : isMine && req.status === 'DONE' ? (
            <p className="flex items-center justify-center gap-2 rounded-12 bg-success-soft px-4 py-3.5 text-sm font-semibold text-success">
              <CircleCheck size={16} aria-hidden="true" />
              Sitting completed
            </p>
          ) : isMine ? (
            <AsideStatus>{closedText}</AsideStatus>
          ) : !member ? (
            <>
              <Link
                href="/login"
                className={buttonClass({ variant: 'primary', size: 'md', className: 'w-full' })}
              >
                Apply
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted">
                <ShieldCheck size={15} className="text-olive" aria-hidden="true" />
                Log in to offer your help.
              </p>
            </>
          ) : req.status === 'OPEN' && (!myApplication || myApplication.status === 'PENDING') ? (
            <ApplicationAction
              applied={!!myApplication}
              requestId={req.id}
              petName={pet.name}
              vaccinated={pet.isVaccinated}
              when={when}
              areaName={req.areaName}
              note={
                !member.isVerified && (
                  <p className="mt-3 flex items-start gap-1.5 text-sm text-muted">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-olive" aria-hidden="true" />
                    <span>
                      Optional: owners often pick neighbours with a verified badge.{' '}
                      <Link
                        href="/profile/me/verification"
                        className="font-semibold text-olive-dark hover:underline"
                      >
                        Get verified
                      </Link>
                    </span>
                  </p>
                )
              }
            />
          ) : myApplication?.status === 'ACCEPTED' && req.status === 'MATCHED' ? (
            <Link
              href="/messages"
              className={buttonClass({ variant: 'primary', size: 'md', className: 'w-full' })}
            >
              <MessageCircle size={17} aria-hidden="true" />
              Send message
            </Link>
          ) : (
            <AsideStatus>{closedText}</AsideStatus>
          )}
        </aside>
      </div>
    </main>
  );
}
