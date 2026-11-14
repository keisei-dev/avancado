"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Ban, CircleCheck, Flag } from "lucide-react";
import { reportPlace } from "@/app/map/report-actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PLACE_REPORT_REASONS } from "@/lib/report/place-reasons";

export function ReportPlaceButton({
  placeId,
  signedIn,
  className,
  withIcon = true,
}: {
  placeId: string;
  signedIn: boolean;
  className: string;
  withIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const label = (
    <>
      {withIcon && <Flag size={15} aria-hidden="true" />}
      Report incorrect info
    </>
  );

  if (!signedIn) {
    return (
      <Link href="/login" className={className}>
        {label}
      </Link>
    );
  }

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError(null);
  };

  const submit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("placeId", placeId);
      formData.set("reason", reason);
      const result = await reportPlace(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setReason("");
      setError(null);
      setDone(true);
    });
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      <Modal
        open={open}
        onClose={close}
        eyebrow="Community safety"
        title="Report this place"
        lead="Select the reason that best describes your concern. Your report stays private."
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Cancel
            </Button>
            <Button loading={pending} disabled={!reason} onClick={submit}>
              <Flag size={16} aria-hidden="true" />
              Report
            </Button>
          </>
        }
      >
        <fieldset className="grid gap-2.5">
          <legend className="sr-only">Reason</legend>
          {PLACE_REPORT_REASONS.map((item) => (
            <label
              key={item.label}
              className="flex cursor-pointer items-center gap-4 rounded-16 border border-line bg-white px-4 py-3.5 transition-colors hover:border-beige has-[:checked]:border-olive has-[:checked]:bg-sage-faint"
            >
              <input
                type="radio"
                name="place-report-reason"
                value={item.label}
                checked={reason === item.label}
                onChange={() => {
                  setReason(item.label);
                  setError(null);
                }}
                disabled={pending}
                className="size-5 shrink-0 accent-olive"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-brown">
                  <Ban size={14} className="shrink-0 text-brown-2" aria-hidden="true" />
                  {item.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted">{item.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        ) : null}
      </Modal>

      <Modal
        open={done}
        onClose={() => setDone(false)}
        centered
        eyebrow={
          <span className="inline-grid size-16 place-items-center rounded-full bg-sage-soft text-olive ring-8 ring-sage-faint">
            <CircleCheck size={30} aria-hidden="true" />
          </span>
        }
        title="Thanks for your report"
        lead="Our moderation team will review it against the Avancado community guidelines. Reports are private, so no one will know who sent it."
        footer={
          <div className="flex w-full! justify-center">
            <Button onClick={() => setDone(false)}>Done</Button>
          </div>
        }
      />
    </>
  );
}
