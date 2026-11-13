"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { reportSitterRequest } from "@/app/sitter-board/report-actions";
import { ReportModal } from "@/components/report/report-modal";
import { Toast, useToast } from "@/components/ui/toast";
import type { SitterReportReason } from "@/lib/report/sitter-reasons";

const TRIGGER_CLASS =
  "inline-flex min-h-8 items-center gap-1.5 rounded-10 px-1.5 text-[12px] font-semibold text-coral transition-colors hover:text-coral-hover focus-visible:shadow-focus focus-visible:outline-none";

function ReportTriggerLabel() {
  return (
    <>
      <Flag size={14} strokeWidth={2} aria-hidden="true" />
      Report this request
    </>
  );
}

function ReportFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-1 justify-end border-t border-line pt-4">
      {children}
    </div>
  );
}

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
  const [reason, setReason] = useState<SitterReportReason | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { message, showToast } = useToast();

  if (isOwn) {
    return null;
  }

  if (!signedIn) {
    return (
      <ReportFooter>
        <Link href="/login" className={TRIGGER_CLASS}>
          <ReportTriggerLabel />
        </Link>
      </ReportFooter>
    );
  }

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError(null);
    setReason(null);
  };

  const submit = () => {
    if (!reason) return;
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
      setReason(null);
      setError(null);
      showToast("Your report was received.");
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col">
      <ReportFooter>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={TRIGGER_CLASS}
        >
          <ReportTriggerLabel />
        </button>
      </ReportFooter>
      <ReportModal
        open={open}
        onClose={close}
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
    </div>
  );
}
