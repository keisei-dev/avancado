'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Check, Frown, ShieldCheck, Smile } from 'lucide-react';
import { applyToSitterRequest, reviewOwner, withdrawApplication } from '@/app/sitter-board/actions';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/text-area';
import { Toast } from '@/components/ui/toast';

type ApplyProps = {
  requestId: string;
  petName: string;
  vaccinated: boolean;
  when: string;
  areaName: string;
};

// Toast lives here so it stays after Apply turns into Withdraw
export function ApplicationAction({
  applied,
  note,
  ...props
}: ApplyProps & { applied: boolean; note?: ReactNode }) {
  // New id each time so the toast can show again after withdraw + apply
  const [toastId, setToastId] = useState<number | null>(null);

  return (
    <>
      {applied ? (
        <WithdrawButton requestId={props.requestId} />
      ) : (
        <>
          <ApplyButton {...props} onApplied={() => setToastId(Date.now())} />
          {note}
        </>
      )}
      {toastId && <Toast key={toastId} message="Application sent. Track it under Applied." />}
    </>
  );
}

function ApplyButton({
  requestId,
  petName,
  vaccinated,
  when,
  areaName,
  onApplied,
}: ApplyProps & { onApplied: () => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError(null);
  };

  const submit = () => {
    startTransition(async () => {
      const result = await applyToSitterRequest({
        requestId,
        message,
        available,
      });
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setOpen(false);
      setMessage('');
      setAvailable(false);
      onApplied();
    });
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Apply
      </Button>

      <Modal
        open={open}
        onClose={close}
        eyebrow={<span className="mt-1.5 mb-1.5 block">Pet sitting request</span>}
        title={`Apply to sit ${petName}`}
      >
        <p
          className={`-mt-2.5 flex items-start gap-2 rounded-12 px-3.5 py-2.5 text-[13px] ${
            vaccinated ? 'bg-success-soft text-success' : 'bg-amber-soft text-amber-ink'
          }`}
        >
          <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {vaccinated
            ? `${petName} is vaccinated.`
            : `${petName} is not vaccinated yet. Ask the owner in Messages if that matters for your own pets.`}
        </p>

        <label className="mt-4 block">
          <span className="mb-2 block text-[13px] font-semibold text-brown">
            Message to the owner
          </span>
          <Textarea
            value={message}
            onValueChange={(value) => {
              setMessage(value);
              setError(null);
            }}
            rows={4}
            maxLength={500}
            disabled={pending}
            className="text-sm! placeholder:font-medium"
            placeholder={`Hi! I'd love to look after ${petName} because...`}
          />
        </label>

        <p className="mt-3.5 mb-2 text-[13px] font-semibold text-brown">Please confirm</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-16 border border-sage bg-sage-faint px-4 py-3.5 text-sm text-brown">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            disabled={pending}
            className="mt-0.5 size-[18px] shrink-0 accent-olive"
          />
          <span>
            I&apos;m available <strong>{when}</strong> and can arrive in {areaName} on time.
          </span>
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        )}

        <Button
          className="mt-5 w-full"
          loading={pending}
          disabled={!message.trim() || !available}
          onClick={submit}
        >
          Submit application
        </Button>
        <p className="mt-3 text-center text-[13px] text-muted">
          The owner will see your profile and message, and you can chat in Messages.
        </p>
      </Modal>
    </>
  );
}

function WithdrawButton({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const withdraw = () => {
    startTransition(async () => {
      const result = await withdrawApplication(requestId);
      if (!result.success) setError(result.error ?? 'Something went wrong.');
    });
  };

  return (
    <>
      <Button className="w-full" loading={pending} onClick={withdraw}>
        Withdraw offer
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-coral">
          {error}
        </p>
      )}
    </>
  );
}

export function ReviewOwnerButton({
  requestId,
  petName,
  ownerName,
  onDone,
}: {
  requestId: string;
  petName: string;
  ownerName: string;
  onDone: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<'good' | 'bad' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError(null);
  };

  const submit = () => {
    if (!mood) return;
    startTransition(async () => {
      const result = await reviewOwner({ requestId, mood });
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setOpen(false);
      onDone('Thanks for your feedback!');
    });
  };

  const choices = [
    {
      key: 'good',
      label: 'Good',
      Icon: Smile,
      active: 'border-olive bg-sage-faint text-olive-dark ring-4 ring-sage-soft',
    },
    {
      key: 'bad',
      label: 'Not great',
      Icon: Frown,
      active: 'border-coral bg-coral-soft text-coral ring-4 ring-coral-soft',
    },
  ] as const;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Check size={14} aria-hidden="true" />
        Review
      </Button>

      <Modal
        open={open}
        onClose={close}
        eyebrow="Complete sitter request"
        title={`How was your experience with ${petName}?`}
        lead={
          <span className="block sm:-mr-10 sm:whitespace-nowrap">
            Your feedback about {ownerName.trim().split(/\s+/)[0]} helps neighbours trust each
            other.
          </span>
        }
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Not now
            </Button>
            <Button loading={pending} disabled={!mood} onClick={submit}>
              Submit review
            </Button>
          </>
        }
      >
        <div className="flex justify-center gap-3.5">
          {choices.map(({ key, label, Icon, active }) => (
            <button
              key={key}
              type="button"
              aria-pressed={mood === key}
              onClick={() => setMood(key)}
              className={`grid w-32 justify-items-center gap-2 rounded-16 border px-4 py-5 text-[15px] font-semibold transition-colors ${
                mood === key ? active : 'border-line bg-white text-brown-2 hover:border-beige'
              }`}
            >
              <Icon
                size={36}
                strokeWidth={1.6}
                className={mood === key ? '' : key === 'good' ? 'text-olive' : 'text-olive-soft'}
                aria-hidden="true"
              />
              {label}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        )}
      </Modal>
    </>
  );
}
