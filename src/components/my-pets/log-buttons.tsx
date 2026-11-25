"use client";

// Buttons that open the log form (add / edit) or a delete confirmation.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteLog } from "@/app/my-pets/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LOG_CONFIG, type AnyLog } from "@/lib/pets/log-config";
import type { LogKind } from "@/lib/pets/types";
import { LogForm } from "./log-form";
import { cn } from "@/lib/cn";

export function AddLogButton({
  petId,
  kind,
  compact = false,
}: {
  petId: string;
  kind: LogKind;
  compact?: boolean;
}) {
  const config = LOG_CONFIG[kind];
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Add ${config.singular}`}
          title={`Add ${config.singular}`}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong bg-white text-olive-dark transition-colors hover:border-olive hover:bg-sage-faint focus-visible:shadow-focus focus-visible:outline-none"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Add {config.singular}
        </Button>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={config.title}
        title={`Add ${config.singular}`}
      >
        <LogForm
          petId={petId}
          kind={kind}
          onCancel={() => setOpen(false)}
          onDone={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}

export function LogEntryActions({
  petId,
  kind,
  log,
  label,
}: {
  petId: string;
  kind: LogKind;
  log: AnyLog;
  label: string;
}) {
  const config = LOG_CONFIG[kind];
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ENTRY_BUTTON =
    "grid size-10 place-items-center rounded-12 border border-line bg-white transition-colors focus-visible:shadow-focus focus-visible:outline-none";

  function closeDelete() {
    if (busy) return;
    setDeleting(false);
    setError("");
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deleteLog(kind, petId, String(log.id));
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit ${label}`}
        title="Edit"
        className={cn(
          ENTRY_BUTTON,
          "text-brown-2 hover:border-line-strong hover:bg-ivory",
        )}
      >
        <Pencil size={17} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setDeleting(true)}
        aria-label={`Delete ${label}`}
        title="Delete"
        className={cn(
          ENTRY_BUTTON,
          "text-coral hover:border-coral-line hover:bg-coral-soft",
        )}
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        eyebrow={config.title}
        title={`Edit ${config.singular}`}
      >
        <LogForm
          petId={petId}
          kind={kind}
          log={log}
          onCancel={() => setEditing(false)}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </Modal>

      <Modal
        open={deleting}
        onClose={closeDelete}
        title={`Delete this ${config.singular}?`}
        lead="This can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        {error && (
          <p role="alert" className="text-sm text-coral">
            {error}
          </p>
        )}
      </Modal>
    </div>
  );
}
