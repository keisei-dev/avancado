// Notion flow: Map: Review place, Report place

import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Clock, History, MapPin, Phone } from 'lucide-react';
import { categoryLabel } from '@/components/map/categories';
import { daysSince, STALE_DAYS, updatedLabel } from '@/lib/map/format';
import { PlaceMiniMap } from '@/components/map/place-mini-map';
import { ReportPlaceButton } from '@/components/map/report-place-button';
import { getCurrentMember, isAdminMember } from '@/lib/auth/member';
import { prisma } from '@/lib/prisma/client';

export const instant = false;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REPORT_LINK =
  'inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral transition-colors hover:text-coral-hover';

export default async function PlaceDetailPage({ params }: PageProps<'/map/[placeId]'>) {
  await connection();

  const { placeId } = await params;
  if (!UUID_PATTERN.test(placeId)) notFound();

  const [place, member] = await Promise.all([
    prisma.place.findFirst({
      where: { id: placeId, status: 'ACTIVE' },
      include: { category: true },
    }),
    getCurrentMember(),
  ]);
  if (!place) notFound();

  const canReport = !(member && isAdminMember(member));
  const isStale = daysSince(place.updatedAt) > STALE_DAYS;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-7 py-12">
      <Link
        href="/map"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brown-2 transition-colors hover:text-brown"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Back to map
      </Link>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="relative h-[340px] w-full bg-cream">
            {place.imageUrl && (
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
                priority
              />
            )}
          </div>

          <div className="p-8">
            <span className="text-sm font-semibold text-olive-dark">{categoryLabel(place.category)}</span>
            <h1 className="mt-1 mb-2 text-[32px] font-display font-bold tracking-[-0.02em] leading-[1.15] text-brown">
              {place.name}
            </h1>
            <p className="flex items-center gap-1.5 text-[15px] text-brown-2">
              <MapPin size={16} className="shrink-0 text-muted" aria-hidden="true" />
              {place.address}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3.5 text-sm text-brown-2">
              {place.openingHours && (
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-muted" aria-hidden="true" />
                  {place.openingHours}
                </span>
              )}
              {place.phone && (
                <a
                  href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1.5 hover:text-brown"
                >
                  <Phone size={15} className="text-muted" aria-hidden="true" />
                  {place.phone}
                </a>
              )}
              <span className="flex items-center gap-1.5 sm:ml-auto">
                <History size={15} className="text-muted" aria-hidden="true" />
                Updated {updatedLabel(place.updatedAt)}
              </span>
            </div>

            {isStale && (
              <div
                role="note"
                className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-12 border border-amber bg-amber-soft px-4 py-3 text-sm text-amber-ink"
              >
                <AlertTriangle size={16} className="shrink-0" aria-hidden="true" />
                <span className="flex-1">Info may be out of date. Hours or dog rules could have changed.</span>
                {canReport && (
                  <ReportPlaceButton
                    placeId={place.id}
                    signedIn={Boolean(member)}
                    withIcon={false}
                    className="font-semibold underline underline-offset-2 hover:text-brown"
                  />
                )}
              </div>
            )}

            {place.description && (
              <p className="mt-5 whitespace-pre-line text-[15px] leading-[1.75] text-brown-2">
                {place.description}
              </p>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="h-[240px] overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <PlaceMiniMap
              latitude={Number(place.latitude)}
              longitude={Number(place.longitude)}
              slug={place.category.slug}
              name={place.name}
            />
          </div>

          <div className="rounded-2xl border border-line bg-white px-5 py-6 shadow-card">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-dark">
              Getting there
            </span>
            <p className="mt-1.5 text-[15px] font-semibold text-brown">{place.address}</p>
            {place.openingHours && <p className="mt-1.5 text-sm text-brown-2">{place.openingHours}</p>}
            {canReport && (
              <div className="mt-5">
                <ReportPlaceButton placeId={place.id} signedIn={Boolean(member)} className={REPORT_LINK} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
