'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2 } from 'lucide-react';
import {
  cancelMatch,
  deleteSitterRequest,
  reviewSitter,
} from '@/app/sitter-board/[requestId]/actions';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/text-area';
import { firstName } from '@/lib/sitter-board/format';

type Sitter = { name: string; image: string | null; isVerified: boolean };

export function CancelMatchButton({
  requestId,
  sitterName,
  onDone,
}: {
  requestId: string;
  sitterName: string;
  onDone: (message: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  const cancel = () => {
    startTransition(async () => {
      const result = await cancelMatch(requestId);
      onDone(
        result.success
          ? `The match with ${firstName(sitterName)} was cancelled. You can choose another sitter.`
          : (result.error ?? 'Something went wrong.'),
      );
    });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={cancel}
      className="w-full border-coral/40! text-coral! hover:bg-coral-soft!"
    >
      Cancel match
    </Button>
  );
}

export function ReviewSitterButton({
  requestId,
  sitter,
  petName,
  dateLabel,
  durationLabel,
  label,
  className,
  onDone,
}: {
  requestId: string;
  sitter: Sitter;
  petName: string;
  dateLabel: string;
  durationLabel: string;
  label: string;
  className?: string;
  onDone: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError(null);
  };

  const submit = () => {
    startTransition(async () => {
      const result = await reviewSitter({ requestId, rating, comment });
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setOpen(false);
      onDone(
        result.finished
          ? 'Sitting marked as done and your review was posted.'
          : 'Thanks! Your review was posted.',
      );
    });
  };

  return (
    <>
      <Button size="sm" className={className} onClick={() => setOpen(true)}>
        <Check size={14} aria-hidden="true" />
        {label}
      </Button>

      <Modal
        open={open}
        onClose={close}
        eyebrow="Complete sitter request"
        title={`How was your experience with ${firstName(sitter.name)}?`}
        lead="Your review helps neighbours choose trusted pet sitters."
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Not now
            </Button>
            <Button loading={pending} disabled={!rating} onClick={submit}>
              Submit review
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4 rounded-16 bg-ivory px-4 py-4">
          <Avatar name={sitter.name} src={sitter.image} size="lg" verified={sitter.isVerified} />
          <div className="min-w-0">
            <strong className="block font-semibold text-brown">{sitter.name}</strong>
            <span className="block text-sm text-muted">
              Sat {petName} on {dateLabel} · {durationLabel}
            </span>
          </div>
        </div>

        <p className="mt-5 mb-1.5 text-[13px] font-semibold text-brown">Your rating</p>
        <StarRating value={rating} onChange={setRating} size={25} />

        <label className="mt-4 block">
          <span className="mb-2 block text-[13px] font-semibold text-brown">Review note</span>
          <Textarea
            value={comment}
            onValueChange={setComment}
            rows={4}
            maxLength={1000}
            disabled={pending}
            className="text-sm! placeholder:font-medium"
            placeholder="Share what went well and anything other pet owners should know..."
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        )}
      </Modal>
    </>
  );
}

const DELETE_REASONS = [
  'No longer need a sitter',
  'Plans changed',
  'Found help elsewhere',
  'Posted by mistake',
];

export function DeleteRequestButton({
  requestId,
  title,
  applicantCount,
}: {
  requestId: string;
  title: string;
  applicantCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    if (pending) return;
    setOpen(false);
    setReason('');
    setError(null);
  };

  const remove = () => {
    startTransition(async () => {
      const result = await deleteSitterRequest(requestId);
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      router.push('/sitter-board/my-requests?deleted=1');
    });
  };

  return (
    <div className="flex justify-end border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-10 px-1.5 text-sm font-semibold text-coral transition-colors hover:text-coral-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        <Trash2 size={16} aria-hidden="true" />
        Delete my request
      </button>

      <Modal
        open={open}
        onClose={close}
        eyebrow="Delete request"
        title="Delete this sitter request?"
        lead={`This removes “${title}” and closes ${
          applicantCount ? `all ${applicantCount} applications` : 'the request'
        }.`}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Keep request
            </Button>
            <Button variant="danger" loading={pending} disabled={!reason} onClick={remove}>
              <Trash2 size={16} aria-hidden="true" />
              Delete request
            </Button>
          </>
        }
      >
        <p className="mb-2 text-[13px] font-semibold text-brown">Why are you deleting it?</p>
        <div className="grid gap-2">
          {DELETE_REASONS.map((item) => {
            const active = reason === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setReason(item)}
                className={`flex items-center gap-3 rounded-16 border px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                  active
                    ? 'border-olive bg-sage-faint text-brown'
                    : 'border-line bg-white text-brown hover:border-beige'
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    active ? 'border-olive bg-olive text-white' : 'border-line-strong'
                  }`}
                >
                  {active && <Check size={13} aria-hidden="true" />}
                </span>
                {item}
              </button>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        )}
      </Modal>
    </div>
  );
}
