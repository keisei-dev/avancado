'use client';

import { useLayoutEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, CircleCheck, Star, UsersRound } from 'lucide-react';
import { selectSitter } from '@/app/sitter-board/[requestId]/actions';
import { Avatar } from '@/components/ui/avatar';
import { Button, buttonClass } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { firstName, statsLine } from '@/lib/sitter-board/format';
import type { SitterStats } from '@/lib/sitter-board/stats';

export type ApplicantItem = {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  isVerified: boolean;
  message: string;
  appliedLabel: string;
  cancelled: boolean;
  stats: SitterStats;
};

type Sort = 'earliest' | 'rating';

function ApplicantCard({
  applicant,
  selected,
  dimmed,
  onSelect,
  onChoose,
}: {
  applicant: ApplicantItem;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  onChoose: () => void;
}) {
  const { stats } = applicant;
  const sits = `${stats.sits} completed sit${stats.sits === 1 ? '' : 's'}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect();
      }}
      className={`relative flex cursor-pointer flex-col rounded-2xl border bg-white p-5 transition-all ${
        selected ? 'border-olive shadow-raised' : 'border-line hover:border-beige'
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3.5">
        <Avatar
          name={applicant.name}
          src={applicant.image}
          size="md"
          verified={applicant.isVerified}
        />
        <div className="min-w-0 flex-1">
          <strong className="block text-[17px] font-semibold text-brown">{applicant.name}</strong>
          <span className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
            {stats.rating !== null && (
              <Star size={12} className="shrink-0 text-star" fill="currentColor" aria-hidden="true" />
            )}
            {stats.rating !== null
              ? `${stats.rating} stars (${stats.reviews} review${stats.reviews === 1 ? '' : 's'}) · ${sits}`
              : `No reviews yet · ${sits}`}
          </span>
          <span className="mt-0.5 block text-[13px] text-muted">
            {applicant.appliedLabel}
            {applicant.cancelled && ' · Match cancelled'}
          </span>
          <Link
            href={`/profile/${applicant.userId}`}
            onClick={(event) => event.stopPropagation()}
            className="mt-1.5 inline-block text-sm font-semibold text-olive-dark hover:underline"
          >
            View profile →
          </Link>
        </div>
        {selected && (
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive text-white">
            <Check size={14} aria-hidden="true" />
          </span>
        )}
      </div>

      <span className="mt-4 mb-2 block text-[13px] text-muted">
        Message from {firstName(applicant.name)}
      </span>
      <p className="flex-1 rounded-16 bg-ivory px-4 py-3.5 text-[15px] leading-relaxed text-brown-2 whitespace-pre-line">
        {applicant.message}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Link
          href="/messages"
          onClick={(event) => event.stopPropagation()}
          className={buttonClass({ variant: 'secondary', size: 'sm' })}
        >
          Send message
        </Link>
        <Button
          size="sm"
          disabled={applicant.cancelled}
          onClick={(event) => {
            event.stopPropagation();
            onChoose();
          }}
        >
          Select this sitter
        </Button>
      </div>
    </div>
  );
}

// Stays mounted after matching so the Congratulations modal can show
export function ApplicantList({
  open,
  requestId,
  petName,
  dateLabel,
  applicants,
}: {
  open: boolean;
  requestId: string;
  petName: string;
  dateLabel: string;
  applicants: ApplicantItem[];
}) {
  const [sort, setSort] = useState<Sort>('earliest');
  const [selected, setSelected] = useState('');
  const [confirming, setConfirming] = useState<ApplicantItem | null>(null);
  const [congrats, setCongrats] = useState<ApplicantItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Next keeps a visited page's state, so clear the popup when we leave
  useLayoutEffect(() => () => setCongrats(null), []);

  const sorted =
    sort === 'rating'
      ? [...applicants].sort((a, b) => (b.stats.rating ?? 0) - (a.stats.rating ?? 0))
      : applicants;

  const confirm = () => {
    if (!confirming) return;
    startTransition(async () => {
      const result = await selectSitter(requestId, confirming.id);
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setCongrats(confirming);
      setConfirming(null);
      setSelected('');
    });
  };

  const closeConfirm = () => {
    if (pending) return;
    setConfirming(null);
    setSelected('');
    setError(null);
  };

  return (
    <>
      {open && (
        <section
          id="applicants"
          className="mt-6 scroll-mt-24 rounded-2xl border border-line bg-white p-8 shadow-card"
        >
          <h2 className="font-display text-[26px] font-bold tracking-[-0.02em] text-brown">
            Choose the best match for {petName}
          </h2>
          <p className="mt-2 text-[15px] text-muted">
            Select an applicant card to review your choice. You can message any applicant before you
            decide.
          </p>

          <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-olive-dark">
              {applicants.length} applicant{applicants.length === 1 ? '' : 's'}
            </span>
            <label className="flex items-center gap-2.5 text-sm text-muted">
              Sort by:
              <span className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as Sort)}
                  className="appearance-none rounded-12 border border-line-strong bg-white py-2.5 pr-10 pl-4 text-sm font-semibold text-brown focus-visible:shadow-focus focus-visible:outline-none"
                >
                  <option value="earliest">Earliest application</option>
                  <option value="rating">Highest rating</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-brown"
                  aria-hidden="true"
                />
              </span>
            </label>
          </div>

          {sorted.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {sorted.map((a) => (
                <ApplicantCard
                  key={a.id}
                  applicant={a}
                  selected={selected === a.id}
                  dimmed={Boolean(selected) && selected !== a.id}
                  onSelect={() => setSelected(selected === a.id ? '' : a.id)}
                  onChoose={() => {
                    setSelected(a.id);
                    setConfirming(a);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<UsersRound size={22} />}
              title="No applicants yet"
              text="We’ll notify you as soon as a neighbour offers to help."
            />
          )}
        </section>
      )}

      <Modal
        open={Boolean(confirming)}
        onClose={closeConfirm}
        centered
        title="Confirm matched"
        footer={
          <div className="flex w-full! justify-center gap-2.5">
            <Button variant="secondary" onClick={closeConfirm} disabled={pending}>
              Select other
            </Button>
            <Button loading={pending} onClick={confirm}>
              Confirm
            </Button>
          </div>
        }
      >
        {confirming && (
          <div className="mx-auto grid w-fit min-w-[240px] justify-items-center gap-1 rounded-16 border border-sage bg-sage-faint px-10 py-6">
            <Avatar
              name={confirming.name}
              src={confirming.image}
              size="lg"
              verified={confirming.isVerified}
            />
            <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-olive-dark">
              Selected sitter
            </span>
            <strong className="text-lg font-semibold text-brown">{confirming.name}</strong>
            <span className="text-[13px] text-muted">{statsLine(confirming.stats)}</span>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        )}
      </Modal>

      <Modal
        open={Boolean(congrats)}
        onClose={() => setCongrats(null)}
        centered
        eyebrow={
          <span className="inline-grid size-16 place-items-center rounded-full bg-sage-soft text-olive ring-8 ring-sage-faint">
            <CircleCheck size={30} aria-hidden="true" />
          </span>
        }
        title="Congratulations"
        lead={
          congrats &&
          `${congrats.name} will care for ${petName} on ${dateLabel}. You can plan the details together in Messages.`
        }
        footer={
          <div className="flex w-full! justify-center gap-2.5">
            <Link href="/messages" className={buttonClass({ variant: 'secondary' })}>
              Send message
            </Link>
            <Link
              href="/sitter-board/my-requests?status=MATCHED"
              className={buttonClass({ variant: 'primary' })}
            >
              Go to matched page
            </Link>
          </div>
        }
      />
    </>
  );
}
