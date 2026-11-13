"use client";

// Buttons that open the pet form in a modal.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
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

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil size={15} aria-hidden="true" />
        Edit profile
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="My pets"
        title={`Edit ${pet.name}`}
        size="wide"
      >
        <PetForm
          memberId={memberId}
          pet={pet}
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
