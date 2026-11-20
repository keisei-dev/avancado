"use client";

// Buttons that open the log form (add / edit) or a delete confirmation.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteLog } from "@/app/my-pets/actions";
import { Button, IconButton } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LOG_CONFIG, type AnyLog } from "@/lib/pets/log-config";
import type { LogKind } from "@/lib/pets/types";
import { LogForm } from "./log-form";

export function AddLogButton({
  petId,
  kind,
  compact = false,
}: {
  petId: string;
  kind: LogKind;
  /** Icon-only "+" (dashboard cards). */
  compact?: boolean;
}) {
  const config = LOG_CONFIG[kind];
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {compact ? (
        <IconButton
          aria-label={`Add ${config.singular}`}
          onClick={() => setOpen(true)}
        >
          <Plus size={18} aria-hidden="true" />
        </IconButton>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
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
}: {
  petId: string;
  kind: LogKind;
  log: AnyLog;
}) {
  const config = LOG_CONFIG[kind];
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex shrink-0 gap-1">
      <Button variant="text" size="sm" onClick={() => setEditing(true)}>
        <Pencil size={15} aria-hidden="true" />
        Edit
      </Button>
      <Button
        variant="text"
        size="sm"
        onClick={() => setDeleting(true)}
        className="text-coral hover:text-coral"
      >
        <Trash2 size={15} aria-hidden="true" />
        Delete
      </Button>

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
