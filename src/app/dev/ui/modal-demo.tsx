"use client";

// Preview only: buttons that open each popup on /dev/ui.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Modal, SuccessDialog } from "@/components/ui/modal";

export function ModalDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        Modal
      </Button>
      <Button variant="danger" onClick={() => setConfirmOpen(true)}>
        Confirm dialog
      </Button>
      <Button onClick={() => setSuccessOpen(true)}>Success dialog</Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit request"
        lead="Change the dates or notes."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button>
          </>
        }
      >
        <p className="text-sm text-muted">Your form goes here.</p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        title="Delete this post?"
        description="It will be removed for everyone. This can't be undone."
      />

      <SuccessDialog
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Mark Mochi as found?"
        description="The lost-pet post will close."
        confirmLabel="Mark as found"
        successTitle="Mochi is home!"
        successMessage="Thanks for letting the community know."
      />

    </div>
  );
}
