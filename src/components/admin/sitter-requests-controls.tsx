"use client";

import { useState } from "react";
import { Eye, Flag, Trash2 } from "lucide-react";
import {
  deleteSitterRequest,
  dismissSitterReport,
  hideSitterRequest,
  resolveSitterReport,
} from "@/app/admin/(protected)/sitter-requests/actions";
import { RelativePostedAt } from "@/components/admin/community-controls";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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

export function ViewSitterRequestButton({
  request,
}: {
  request: ViewRequest;
}) {
  const [open, setOpen] = useState(false);
  const owner = request.author.name.trim() || "Member";
  const petLine = `${request.pet.name}${request.pet.breed ? `, ${request.pet.breed}` : ""}`;

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
        title={request.title}
        lead={`${petLine} · ${request.areaName}`}
        size="wide"
        footer={
          <>
            {request.status !== "HIDDEN" ? (
              <form action={hideSitterRequest} onSubmit={() => setOpen(false)}>
                <input type="hidden" name="requestId" value={request.id} />
                <Button type="submit" variant="secondary">
                  Hide request
                </Button>
              </form>
            ) : null}
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        <div className="grid gap-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Pet owner
              </dt>
              <dd className="mt-0.5 font-semibold text-brown">{owner}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Selected sitter
              </dt>
              <dd className="mt-0.5 text-brown">
                {request.selectedSitterName ?? "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Current status
              </dt>
              <dd className="mt-0.5 text-brown">
                {requestStatusLabel(request.status)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Request ID
              </dt>
              <dd className="mt-0.5 font-mono text-brown" title={request.id}>
                {shortRequestId(request.id)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Applicants
              </dt>
              <dd className="mt-0.5 text-brown">{request.applicantCount}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Sitting date
              </dt>
              <dd className="mt-0.5 text-brown">
                {formatSittingDate(request.startAt)}
              </dd>
            </div>
          </dl>
          <p className="whitespace-pre-wrap leading-6 text-brown-2">
            {request.description}
          </p>
          {request.openReports.length > 0 ? (
            <div className="rounded-12 bg-coral-soft p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-coral">
                <Flag size={13} aria-hidden="true" />
                {request.openReports.length === 1
                  ? "1 open report"
                  : `${request.openReports.length} open reports`}
              </p>
              <ul className="grid gap-2">
                {request.openReports.map((report) => (
                  <li
                    key={report.id}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="text-[13px] text-brown">
                      <span className="font-semibold">{report.reason}</span>
                      <span className="text-muted">
                        {" "}
                        · {report.reporterName} ·{" "}
                        <RelativePostedAt at={report.createdAt} />
                      </span>
                    </span>
                    <span className="flex gap-1.5">
                      <form action={resolveSitterReport}>
                        <input type="hidden" name="reportId" value={report.id} />
                        <button type="submit" className={ACTION_BTN}>
                          Resolve
                        </button>
                      </form>
                      <form action={dismissSitterReport}>
                        <input type="hidden" name="reportId" value={report.id} />
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-coral outline-none hover:bg-ivory focus-visible:shadow-focus"
                        >
                          Dismiss
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {/* TODO: Prototype contact log is not in the schema; phone numbers stay private. */}
        </div>
      </Modal>
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
