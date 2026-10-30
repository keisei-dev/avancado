"use client";

// UI library (P1): Modal, ConfirmDialog, SuccessDialog
/**
 * Modal: dialog with title, optional lead text, body and an action row.
 * Sizes: default (540px) and wide (720px). On phones it stays a card with
 * smaller padding, and the actions stack full width.
 * Escape, the × button or a click on the backdrop closes it. Focus stays
 * inside while it's open and goes back to the opening button after.
 *
 * ConfirmDialog: "Are you sure?" step, coral button by default.
 * SuccessDialog: confirm step, then a centred success message.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const SIZES = {
  default: "max-w-[540px]",
  wide: "max-w-[720px]",
} as const;

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// ----------------------------------------
// Modal
// ----------------------------------------

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Small green label above the title, e.g. "Sitter board". */
  eyebrow?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  /** Buttons. Put Cancel first and the main action last. */
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  /** Centre the title, lead and body (success and info messages). */
  centered?: boolean;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  lead,
  children,
  footer,
  size = "default",
  centered = false,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const leadId = useId();

  // Keep the latest onClose without re-running the effect below. Otherwise a
  // parent passing `onClose={() => setOpen(false)}` would move focus back to
  // the first field on every render (every key typed).
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

    // First field or button in the content, not the × button.
    const first = dialog.querySelector<HTMLElement>(
      `[data-modal-content] :is(${FOCUSABLE})`,
    );
    (first ?? dialog).focus();

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

  // Render into <body> so the top bar and tab bar can't sit on top of it.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[rgb(36_28_20/0.42)] p-4 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={lead ? leadId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full animate-pop-in rounded-20 bg-white px-5 py-[26px] text-brown shadow-overlay outline-none sm:p-8",
          SIZES[size],
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 grid size-9 place-items-center rounded-full bg-ivory text-muted transition-colors hover:bg-cream hover:text-brown focus-visible:shadow-focus focus-visible:outline-none sm:top-[18px] sm:right-[18px]"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div data-modal-content>
          <div
            className={cn(
              centered
                ? "grid justify-items-center gap-3.5 px-2 pt-2 text-center"
                : "pr-10",
            )}
          >
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="font-display text-xl font-bold tracking-tight sm:text-2xl"
            >
              {title}
            </h2>
            {lead && (
              <p
                id={leadId}
                className={cn(
                  "text-[15px] text-muted",
                  centered ? "max-w-[400px]" : "mt-2",
                )}
              >
                {lead}
              </p>
            )}
          </div>

          {children && (
            <div className={cn("mt-[22px]", centered && "text-center")}>
              {children}
            </div>
          )}

          {footer && (
            <div
              className={cn(
                "mt-[26px] flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto",
                centered ? "sm:justify-center" : "border-t border-line pt-5",
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ----------------------------------------
// ConfirmDialog
// ----------------------------------------

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Can be async: the button shows a spinner until it finishes. */
  onConfirm: () => void | Promise<void>;
  title?: ReactNode;
  description: ReactNode;
  /** Extra text under the description, e.g. "This can't be undone." */
  note?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" (coral) for delete/remove, "primary" (olive) for the rest. */
  tone?: "danger" | "primary";
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  note,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      lead={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone} loading={busy} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {note && <p className="text-sm text-muted">{note}</p>}
    </Modal>
  );
}

// ----------------------------------------
// SuccessDialog
// ----------------------------------------

export type SuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title?: ReactNode;
  description?: ReactNode;
  successTitle?: ReactNode;
  successMessage?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  successLabel?: string;
};

export function SuccessDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  description = "Are you sure you want to continue?",
  successTitle = "All done!",
  successMessage = "Your action was completed successfully.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  successLabel = "Done",
}: SuccessDialogProps) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [busy, setBusy] = useState(false);

  // Each step has its own key, so focus moves to the new step's button.
  // Start at the confirm step again next time it opens.
  const close = () => {
    onClose();
    setStep("confirm");
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
      setStep("success");
    } finally {
      setBusy(false);
    }
  };

  if (step === "success") {
    return (
      <Modal
        key="success"
        open={open}
        onClose={close}
        centered
        title={
          <>
            <span
              aria-hidden="true"
              className="mx-auto mb-3.5 grid size-16 place-items-center rounded-full bg-sage-soft text-olive shadow-[0_0_0_8px_var(--color-sage-faint)]"
            >
              <Check size={30} strokeWidth={2.5} />
            </span>
            {successTitle}
          </>
        }
        lead={successMessage}
        footer={<Button onClick={close}>{successLabel}</Button>}
      />
    );
  }

  return (
    <Modal
      key="confirm"
      open={open}
      onClose={busy ? () => {} : close}
      title={title}
      lead={description}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button loading={busy} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
