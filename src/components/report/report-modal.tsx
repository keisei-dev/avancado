"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ReportModal({
  open,
  onClose,
  reasons,
  selectedReason,
  onReasonChange,
  pending = false,
  error = null,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  reasons: readonly string[];
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  pending?: boolean;
  error?: string | null;
  onSubmit: () => void | Promise<void>;
}) {
  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      eyebrow="Sitter board"
      title="Report this request?"
      lead="Tell us what’s wrong. A moderator will review it."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={pending}
            disabled={!selectedReason}
            onClick={onSubmit}
          >
            Submit report
          </Button>
        </>
      }
    >
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium text-brown">Reason</legend>
        {reasons.map((reason) => (
          <label
            key={reason}
            className="flex cursor-pointer items-center gap-2.5 rounded-12 border border-line bg-ivory px-3 py-2.5 text-sm text-brown has-[:checked]:border-olive has-[:checked]:bg-sage-faint"
          >
            <input
              type="radio"
              name="report-reason"
              value={reason}
              checked={selectedReason === reason}
              onChange={() => onReasonChange(reason)}
              disabled={pending}
              className="accent-olive"
            />
            {reason}
          </label>
        ))}
      </fieldset>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-coral">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
