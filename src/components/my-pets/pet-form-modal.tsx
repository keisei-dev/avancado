"use client";

// Buttons that open the pet form in a modal.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Plus } from "lucide-react";
import { archivePet } from "@/app/my-pets/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { PetProfile } from "@/lib/pets/types";
import { PetForm } from "./pet-form";

export function AddPetButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-16 border-[1.5px] border-dashed border-line-strong p-3 text-sm font-semibold text-olive-dark hover:border-olive hover:bg-sage-faint"
      >
        <Plus size={17} aria-hidden="true" />
        Add another pet
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="My pets"
        title="Add a pet"
        size="wide"
      >
        <PetForm
          memberId={memberId}
          onCancel={() => setOpen(false)}
          onDone={(petId) => {
            setOpen(false);
            router.push(`/my-pets/${petId}`);
          }}
        />
      </Modal>
    </>
  );
}

export function EditPetButton({
  memberId,
  pet,
}: {
  memberId: string;
  pet: PetProfile;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // One modal, two steps: the edit form, then the archive confirmation.
  const [step, setStep] = useState<"edit" | "archive">("edit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    if (busy) return;
    setOpen(false);
    setStep("edit");
    setError("");
  }

  function backToForm() {
    setStep("edit");
    setError("");
  }

  async function archive() {
    setBusy(true);
    const result = await archivePet(pet.id);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setStep("edit");
    router.push("/my-pets");
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil size={15} aria-hidden="true" />
        Edit profile
      </Button>

      {step === "edit" ? (
        <Modal
          key="edit"
          open={open}
          onClose={close}
          eyebrow="My pets"
          title={`Edit ${pet.name}`}
          size="wide"
        >
          <PetForm
            memberId={memberId}
            pet={pet}
            onCancel={close}
            onDone={() => {
              close();
              router.refresh();
            }}
            extraAction={
              <Button
                variant="text"
                size="sm"
                onClick={() => setStep("archive")}
                className="text-coral hover:text-coral-hover"
              >
                <Archive size={15} aria-hidden="true" />
                Archive pet
              </Button>
            }
          />
        </Modal>
      ) : (
        <Modal
          key="archive"
          open={open}
          onClose={close}
          title={`Archive ${pet.name}?`}
          lead={`${pet.name} will be hidden from My Pets. Health records are kept.`}
          footer={
            <>
              <Button variant="secondary" onClick={backToForm} disabled={busy}>
                Back
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
              Pets with an open or matched sitter request can&apos;t be
              archived.
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
