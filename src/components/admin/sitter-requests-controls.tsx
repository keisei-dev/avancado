"use client";

import { useState, type ReactNode } from "react";
import { Eye, Flag, Lock, Trash2 } from "lucide-react";
import {
  deleteSitterRequest,
  dismissSitterReport,
  hideSitterRequest,
  resolveSitterReport,
  restoreSitterRequest,
} from "@/app/admin/(protected)/sitter-requests/actions";
import { RelativePostedAt } from "@/components/admin/community-controls";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

type ViewRequest = {
  id: string;
  title: string;
  description: string;
  areaName: string;
  startAt: Date | string;
  status: string;
  applicantCount: number;
  selectedSitterName: string | null;
  author: { name: string };
  pet: { name: string; breed: string };
  openReports: {
    id: string;
    reason: string;
    createdAt: Date;
    reporterName: string;
  }[];
};

function shortRequestId(id: string) {
  return `SR-${id.slice(0, 6).toUpperCase()}`;
}

function formatSittingDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function requestStatusLabel(status: string) {
  switch (status) {
    case "MATCHED":
      return "Matched";
    case "DONE":
      return "Done";
    case "CANCELLED":
      return "Cancelled";
    case "HIDDEN":
      return "Hidden";
    default:
      return "Open";
  }
}

const ACTION_BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-brown-2 outline-none hover:bg-ivory focus-visible:shadow-focus";

const PILL_BADGE =
  "inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        PILL_BADGE,
        status === "OPEN"
          ? "bg-success-soft text-success"
          : status === "MATCHED"
            ? "bg-sage-soft text-olive-hover"
            : status === "DONE"
              ? "bg-sky-soft text-sky-ink"
              : "bg-cream text-muted",
      )}
    >
      {requestStatusLabel(status)}
    </span>
  );
}

function DetailCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-12 bg-cream px-3.5 py-3">
      <p className="text-[12px] text-muted">{label}</p>
      <div className="mt-1 text-sm font-semibold text-brown">{children}</div>
    </div>
  );
}

export function ViewSitterRequestButton({
  request,
}: {
  request: ViewRequest;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const owner = request.author.name.trim() || "Member";
  const hidden = request.status === "HIDDEN";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={ACTION_BTN}>
        <Eye size={15} aria-hidden="true" />
        View
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Request details"
        title="Match & contact log"
        lead={request.title}
        size="wide"
        footer={
          <>
            <form
              action={hidden ? restoreSitterRequest : hideSitterRequest}
              onSubmit={() => setOpen(false)}
            >
              <input type="hidden" name="requestId" value={request.id} />
              <Button type="submit" variant="secondary">
                {hidden ? "Unhide request" : "Hide request"}
              </Button>
            </form>
            <Button
              variant="danger"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete
            </Button>
          </>
        }
      >
        <div className="grid gap-3 text-sm">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <DetailCard label="Pet owner">{owner}</DetailCard>
            <DetailCard label="Selected sitter">
              {request.selectedSitterName ?? "Not selected"}
            </DetailCard>
            <DetailCard label="Current status">
              <StatusBadge status={request.status} />
            </DetailCard>
            <DetailCard label="Post ID">
              <span title={request.id}>{shortRequestId(request.id)}</span>
            </DetailCard>
            <DetailCard label="Applicants">
              {request.applicantCount}
            </DetailCard>
            <DetailCard label="Sitting date">
              {formatSittingDate(request.startAt)}
            </DetailCard>
          </div>
          {request.description ? (
            <p className="whitespace-pre-wrap leading-6 text-muted">
              {request.description}
            </p>
          ) : null}
          {request.openReports.length > 0 ? (
            <div className="flex gap-3 rounded-12 bg-coral-soft px-4 py-3.5 text-coral">
              <Flag size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">Open reports</p>
                <ul className="mt-1 grid gap-2">
                  {request.openReports.map((report) => (
                    <li
                      key={report.id}
                      className="flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="text-[13px]">
                        {report.reason}
                        {" · "}
                        <RelativePostedAt at={report.createdAt} dayLabel />
                      </span>
                      <span className="flex gap-1.5">
                        <form action={resolveSitterReport}>
                          <input
                            type="hidden"
                            name="reportId"
                            value={report.id}
                          />
                          <button type="submit" className={ACTION_BTN}>
                            Resolve
                          </button>
                        </form>
                        <form action={dismissSitterReport}>
                          <input
                            type="hidden"
                            name="reportId"
                            value={report.id}
                          />
                          <button type="submit" className={ACTION_BTN}>
                            Dismiss
                          </button>
                        </form>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
          <div className="flex gap-3 rounded-12 bg-sky-soft px-4 py-3.5 text-sky-ink">
            <Lock size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold">
                Contact log is protected
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-brown-2">
                Private contact information is only unlocked when a dispute
                report requires investigation.
              </p>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        eyebrow="Permanent action"
        title={`Delete “${request.title}”?`}
        lead="This hides it from the Sitter Board. Use Hide if you might want to restore it later."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmDelete(false);
                setOpen(true);
              }}
            >
              Cancel
            </Button>
            <form
              action={deleteSitterRequest}
              onSubmit={() => setConfirmDelete(false)}
            >
              <input type="hidden" name="requestId" value={request.id} />
              <Button type="submit" variant="danger">
                Delete request
              </Button>
            </form>
          </>
        }
      />
    </>
  );
}

export function DeleteSitterRequestButton({
  requestId,
  title,
}: {
  requestId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-coral outline-none hover:bg-ivory focus-visible:shadow-focus"
      >
        <Trash2 size={15} aria-hidden="true" />
        Delete
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Permanent action"
        title={`Delete “${title}”?`}
        lead="This hides it from the Sitter Board. Use Hide if you might want to restore it later."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteSitterRequest} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="requestId" value={requestId} />
              <Button type="submit" variant="danger">
                Delete request
              </Button>
            </form>
          </>
        }
      />
    </>
  );
}
