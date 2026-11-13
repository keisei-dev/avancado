import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { ReportRequestButton } from '@/components/sitter-board/report-request-button';
import { timeAgo } from '@/components/sitter-board/request-card';
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
  const dateParts = sameDay ? [shortDate(start)] : [`${shortDate(start)} –`, shortDate(end)];
  const durationHours = req.durationMinutes
    ? (req.durationMinutes / 60).toFixed(1).replace('.0', '')
    : null;
  const applicantCount = req.applications.length;

  const facts = [
    { icon: Calendar, label: 'Date', parts: dateParts },
    {
      icon: Clock,
      label: 'Time',
      parts: [
        `${start.toLocaleTimeString('en-US', timeFormat)} –`,
        end.toLocaleTimeString('en-US', timeFormat),
      ],
    },
    { icon: Activity, label: 'Duration', parts: [durationHours ? `${durationHours} hours` : 'N/A'] },
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

            {isAdmin ? null : (
              <ReportRequestButton
                requestId={req.id}
                signedIn={Boolean(member)}
                isOwn={isMine}
              />
            )}
          </div>
        </article>

        {/* Pet + action card */}
        <aside className="bg-white rounded-2xl border border-line shadow-card p-6">
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

          {isAdmin ? null : isMine ? (
            <Link
              href={`/sitter-board/my-requests/${req.id}`}
              className={buttonClass({ variant: 'primary', size: 'md', className: 'w-full' })}
            >
              Review applicants ({applicantCount})
            </Link>
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
          ) : (
            <>
              <button
                type="button"
                className={buttonClass({ variant: 'primary', size: 'md', className: 'w-full' })}
              >
                Apply
              </button>
              {!member.isVerified && (
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
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
