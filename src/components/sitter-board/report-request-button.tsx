"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { reportSitterRequest } from "@/app/sitter-board/report-actions";
import { ReportModal } from "@/components/report/report-modal";
import { Toast, useToast } from "@/components/ui/toast";
import { SITTER_REPORT_REASONS } from "@/lib/report/sitter-reasons";

const TRIGGER_CLASS =
  "text-xs font-semibold text-red-600 transition-colors hover:text-red-800";

export function ReportRequestButton({
  requestId,
  signedIn,
  isOwn,
}: {
  requestId: string;
  signedIn: boolean;
  isOwn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { message, showToast } = useToast();

  if (isOwn) {
    return null;
  }

  if (!signedIn) {
    return (
      <Link href="/login" className={TRIGGER_CLASS}>
        Report this request
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
      formData.set("requestId", requestId);
      formData.set("reason", reason);
      const result = await reportSitterRequest(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setReason("");
      setError(null);
      showToast("Your report was received.");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={TRIGGER_CLASS}
      >
        Report this request
      </button>
      <ReportModal
        open={open}
        onClose={close}
        reasons={SITTER_REPORT_REASONS}
        selectedReason={reason}
        onReasonChange={(next) => {
          setReason(next);
          setError(null);
        }}
        pending={pending}
        error={error}
        onSubmit={submit}
      />
      {message ? <Toast key={message} message={message} /> : null}
    </>
  );
}
