"use client";

// Add / edit pet form. Used inside a modal and on /my-pets/new.

import { useActionState, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { savePet, type PetActionResult } from "@/app/my-pets/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Textarea } from "@/components/ui/text-area";
import { ChoicePills, Switch } from "@/components/ui/toggle";
import { neuterLabel, today } from "@/lib/pets/format";
import { removePetPhoto, uploadPetPhoto } from "@/lib/pets/pet-photo";
import type { PetProfile } from "@/lib/pets/types";
import { PetPhoto } from "./pet-photo";

// ChoicePills show labels; the form sends the database values.
const SPECIES = { Dog: "DOG", Cat: "CAT" } as const;
const GENDERS = { Female: "FEMALE", Male: "MALE" } as const;

export type PetFormProps = {
  memberId: string;
  /** Edit mode when set. */
  pet?: PetProfile;
  onCancel?: () => void;
  /** Called after a successful save. Default: open the pet's page. */
  onDone?: (petId: string) => void;
};

export function PetForm({ memberId, pet, onCancel, onDone }: PetFormProps) {
  const router = useRouter();
  const [species, setSpecies] = useState<"DOG" | "CAT">(pet?.species ?? "DOG");
  const [gender, setGender] = useState<"FEMALE" | "MALE">(
    pet?.gender === "MALE" ? "MALE" : "FEMALE",
  );
  const [isNeutered, setIsNeutered] = useState(pet?.isNeutered ?? false);
  const [isVaccinated, setIsVaccinated] = useState(pet?.isVaccinated ?? false);
  const [photo, setPhoto] = useState<File | null>(null);

  const [state, formAction, pending] = useActionState(
    async (previous: PetActionResult, form: FormData) => {
      let photoPath = "";
      if (photo) {
        try {
          photoPath = await uploadPetPhoto(memberId, photo);
        } catch {
          return {
            error:
              "Photo upload failed. Please choose a JPG or PNG photo and try again.",
          };
        }
        form.set("imagePath", photoPath);
      }

      const result = await savePet(previous, form);

      if (result.error) {
        if (photoPath) await removePetPhoto(photoPath);
        return result;
      }
      if (result.petId) {
        if (onDone) onDone(result.petId);
        else router.push(`/my-pets/${result.petId}`);
      }
      return result;
    },
    { error: "" },
  );

  return (
    <form action={formAction}>
      {/* Values from ChoicePills / Switch (they have no "name" of their own). */}
      {pet && <input type="hidden" name="petId" value={pet.id} />}
      <input type="hidden" name="species" value={species} />
      <input type="hidden" name="gender" value={gender} />
      {isNeutered && <input type="hidden" name="isNeutered" value="on" />}
      <input type="hidden" name="isVaccinated" value={String(isVaccinated)} />

      <fieldset disabled={pending} className="grid gap-4 tablet:grid-cols-2">
        <div className="grid gap-2 tablet:col-span-2">
          {pet?.imageUrl && !photo && (
            <div className="flex items-center gap-3 text-sm text-muted">
              <PetPhoto name={pet.name} imageUrl={pet.imageUrl} />
              Current photo. Pick a new one below to replace it.
            </div>
          )}
          <PhotoUpload
            value={photo}
            onChange={setPhoto}
            label={pet?.imageUrl ? "Replace photo" : "Add a photo"}
            hint="JPG or PNG. Optional."
          />
        </div>

        {/* Species is fixed after creation (walk logs are for dogs only). */}
        {!pet && (
          <PillGroup label="Species">
            <ChoicePills
              label="Species"
              options={Object.keys(SPECIES)}
              defaultValue="Dog"
              onChange={(label) =>
                setSpecies(SPECIES[label as keyof typeof SPECIES])
              }
            />
          </PillGroup>
        )}

        <Field id="pet-name" label="Name" required>
          <Input
            id="pet-name"
            name="name"
            required
            maxLength={50}
            defaultValue={pet?.name}
          />
        </Field>

        <Field id="pet-breed" label="Breed">
          <Input
            id="pet-breed"
            name="breed"
            maxLength={50}
            defaultValue={pet?.breed}
            placeholder="e.g. Golden Retriever"
          />
        </Field>

        <Field
          id="pet-birth-date"
          label="Birthday"
          hint="An estimate is fine."
          required
        >
          <Input
            id="pet-birth-date"
            name="birthDate"
            type="date"
            required
            max={today()}
            defaultValue={pet?.birthDate ?? ""}
          />
        </Field>

        <Field id="pet-weight" label="Weight (kg)" required>
          <Input
            id="pet-weight"
            name="weight"
            type="number"
            required
            min="0.1"
            max="200"
            step="0.1"
            defaultValue={pet?.weight?.toString() ?? ""}
          />
        </Field>

        <PillGroup label="Gender">
          <ChoicePills
            label="Gender"
            options={Object.keys(GENDERS)}
            defaultValue={gender === "MALE" ? "Male" : "Female"}
            onChange={(label) =>
              setGender(GENDERS[label as keyof typeof GENDERS])
            }
          />
        </PillGroup>

        <PillGroup label="Vaccinations">
          <ChoicePills
            label="Vaccinations"
            options={["Vaccinated", "Not yet"]}
            defaultValue={isVaccinated ? "Vaccinated" : "Not yet"}
            onChange={(label) => setIsVaccinated(label === "Vaccinated")}
          />
        </PillGroup>

        <div className="tablet:col-span-2">
          <Switch
            label={neuterLabel(gender)}
            hint={
              gender === "FEMALE"
                ? "Has she been spayed?"
                : "Has he been neutered?"
            }
            defaultChecked={isNeutered}
            onChange={setIsNeutered}
          />
        </div>

        <Field
          id="pet-notes"
          label="Care notes for sitters"
          hint="Private. Sitters can read them only on your sitter requests."
          className="tablet:col-span-2"
        >
          <Textarea
            id="pet-notes"
            name="notes"
            maxLength={1000}
            defaultValue={pet?.notes ?? ""}
            placeholder="Personality, allergies, medication, habits…"
          />
        </Field>
      </fieldset>

      {state.error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {state.error}
        </p>
      )}

      {/* Same look as the Modal footer, but inside <form> so Submit works. */}
      <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-line pt-5 tablet:flex-row tablet:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={pending}>
          {pet ? "Save changes" : "Add pet"}
        </Button>
      </div>
    </form>
  );
}

// Label + ChoicePills. Field needs an input id, and ChoicePills has none.
function PillGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-brown">{label}</p>
      {children}
    </div>
  );
}
