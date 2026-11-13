"use client";

// "Archive" button with a confirm step. Archived pets are hidden from
// My Pets, but their records stay in the database.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { archivePet } from "@/app/my-pets/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ArchivePetButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    if (busy) return;
    setOpen(false);
    setError("");
  }

  async function archive() {
    setBusy(true);
    const result = await archivePet(petId);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.push("/my-pets");
  }

  return (
    <>
      <Button variant="text" size="sm" onClick={() => setOpen(true)}>
        <Archive size={15} aria-hidden="true" />
        Archive
      </Button>
      <Modal
        open={open}
        onClose={close}
        title={`Archive ${petName}?`}
        lead={`${petName} will be hidden from My Pets. Health records are kept.`}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={archive}>
              Archive
            </Button>
          </>
        }
      >
        {error ? (
          <p role="alert" className="text-sm text-coral">
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted">
            Pets with an open or matched sitter request can&apos;t be archived.
          </p>
        )}
      </Modal>
    </>
  );
}
