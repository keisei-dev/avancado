"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Ban, Check, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  SITTER_REPORT_REASONS,
  type SitterReportReason,
} from "@/lib/report/sitter-reasons";

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function ReportModal({
  open,
  onClose,
  selectedReason,
  onReasonChange,
  pending = false,
  error = null,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  selectedReason: SitterReportReason | null;
  onReasonChange: (reason: SitterReportReason) => void;
  pending?: boolean;
  error?: string | null;
  onSubmit: () => void | Promise<void>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const groupName = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const checked = dialog.querySelector<HTMLElement>('input[type="radio"]:checked');
    const first = dialog.querySelector<HTMLElement>(
      `[data-modal-content] :is(${FOCUSABLE})`,
    );
    (checked ?? first ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === firstEl || active === dialog)) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(36_28_20/0.42)] p-5 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (pending) return;
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-[540px] shrink-0 sm:w-[540px] max-h-[calc(100vh-40px)] overflow-y-auto rounded-3xl bg-white p-6 text-brown shadow-overlay outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 grid size-8 place-items-center rounded-full bg-ivory text-brown transition-colors hover:bg-cream focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-45"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div data-modal-content>
          <p className="text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
            Community safety
          </p>
          <h2
            id={titleId}
            className="font-display mt-1 pr-8 text-2xl leading-[1.3] font-bold tracking-[-0.02em]"
          >
            Report this request
          </h2>
          <p id={descriptionId} className="mt-2 text-[15px] leading-6 text-muted">
            Select the reason that best describes your concern. Your report stays
            private.
          </p>

          <fieldset className="mt-5 grid gap-2 border-0 p-0">
            <legend className="sr-only">Report reason</legend>
            {SITTER_REPORT_REASONS.map((reason) => {
              const checked = selectedReason === reason.key;
              return (
                <label
                  key={reason.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white px-4 py-3.5 transition-colors",
                    "hover:bg-cream has-[:checked]:border-2 has-[:checked]:border-olive has-[:checked]:bg-sage-faint has-[:checked]:hover:bg-sage-faint",
                    "has-[:focus-visible]:shadow-focus",
                    pending && "cursor-not-allowed",
                  )}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={reason.key}
                    checked={checked}
                    aria-checked={checked}
                    disabled={pending}
                    onChange={() => onReasonChange(reason.key)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border border-line-strong bg-white text-transparent peer-checked:border-olive peer-checked:bg-olive peer-checked:text-white"
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-brown">
                      <Ban size={14} aria-hidden="true" className="shrink-0" />
                      {reason.key}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted">
                      {reason.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-coral">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="secondary" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={pending}
              disabled={!selectedReason}
              aria-disabled={!selectedReason || pending}
              className="disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                if (!selectedReason) return;
                onSubmit();
              }}
            >
              <Flag size={16} aria-hidden="true" />
              Report
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
