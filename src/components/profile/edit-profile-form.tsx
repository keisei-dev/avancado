"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Cat, Dog } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { Button } from "@/components/ui/button";
import { updateProfile, type SaveState } from "@/app/profile/me/action";
import { PROFILE_SAVED_EVENT } from "@/components/profile/profile-saved-toast";

type Section = "all" | "about" | "sitting";
type Profile = {
  name: string;
  bio: string | null;
  areaName: string | null;
  careSpecies: string[];
  certificateName: string | null;
  certificateIssuedBy: string | null;
} | null;

export default function EditProfileForm({
  profile,
  section,
}: {
  profile: Profile;
  section: Section;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [careSpecies, setCareSpecies] = useState<string[]>(
    profile?.careSpecies ?? [],
  );
  // Save, then (only when it worked) show the toast and close the modal.
  // This runs once, right when Save finishes. It's not in a useEffect, because
  // Next.js can show a hidden page again later, and effects would run again then.
  async function saveAndClose(previous: SaveState, form: FormData) {
    const result = await updateProfile(previous, form);
    if (result.saved) {
      window.dispatchEvent(new Event(PROFILE_SAVED_EVENT)); // the profile page shows the toast
      router.back(); // closes the modal (back to /profile/me)
    }
    return result;
  }

  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveAndClose,
    { error: "", saved: false },
  );

  const showAbout = section !== "sitting";
  const showSitting = section !== "about";
  const title =
    section === "about"
      ? "About me"
      : section === "sitting"
        ? "Pet sitting"
        : "Edit profile";

  function toggleCare(species: string) {
    setCareSpecies((current) =>
      current.includes(species)
        ? current.filter((value) => value !== species)
        : [...current, species],
    );
  }

  return (
    <Modal open onClose={() => router.back()} title={title}>
      <form action={formAction}>
        {section === "all" && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-olive">
              Edit profile
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold">
              Update your public details
            </h1>
            <PhotoUpload
              label="Profile picture"
              value={photo}
              onChange={setPhoto}
            />
          </div>
        )}

        {showAbout && (
          <div className="mt-4 space-y-4">
            <Field id="name" label="Name" required>
              <Input
                id="name"
                name="name"
                defaultValue={profile?.name ?? ""}
                placeholder="Enter your name"
              />
            </Field>
            <Field
              id="bio"
              label="About me"
              hint="A short introduction for neighbours"
            >
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ""}
                placeholder="Enter your bio"
                rows={4}
              />
            </Field>
            <Field
              id="areaName"
              label="Neighbourhood"
              hint="Neighbourhood only. Never your street address."
            >
              <Input
                id="areaName"
                name="areaName"
                defaultValue={profile?.areaName ?? ""}
                placeholder="Enter your neighbourhood"
              />
            </Field>
          </div>
        )}

        {showSitting && (
          <div className="mt-6 space-y-4 border-t border-line pt-6">
            <input type="hidden" name="sitting" value="1" />
            {careSpecies.map((species) => (
              <input
                key={species}
                type="hidden"
                name="careSpecies"
                value={species}
              />
            ))}
            <h1 className="text-lg font-semibold">
              Pet sitting{" "}
              <span className="text-sm font-normal text-muted">(Optional)</span>
            </h1>
            <Field
              id="experience"
              label="Experience"
              hint="Share your experience with pet sitting"
            >
              <Textarea
                id="experience"
                name="experience"
                placeholder="Enter your experience"
                rows={4}
              />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium text-brown">
                Pets you can care for
              </p>
              <div className="flex gap-2">
                {[
                  { value: "DOG", label: "Dogs", icon: <Dog size={16} /> },
                  { value: "CAT", label: "Cats", icon: <Cat size={16} /> },
                ].map((pet) => (
                  <button
                    key={pet.value}
                    type="button"
                    aria-pressed={careSpecies.includes(pet.value)}
                    onClick={() => toggleCare(pet.value)}
                    className={
                      careSpecies.includes(pet.value)
                        ? "flex items-center gap-1.5 rounded-full border border-olive bg-sage-soft px-4 py-2 text-sm font-semibold text-olive-dark"
                        : "flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brown-2"
                    }
                  >
                    {pet.icon}
                    {pet.label}
                  </button>
                ))}
              </div>
            </div>
            <Field id="certificateName" label="Certificate">
              <Input
                id="certificateName"
                name="certificateName"
                defaultValue={profile?.certificateName ?? ""}
                placeholder="e.g. Pet First Aid"
              />
            </Field>
            <Field id="certificateIssuedBy" label="Issued by">
              <Input
                id="certificateIssuedBy"
                name="certificateIssuedBy"
                defaultValue={profile?.certificateIssuedBy ?? ""}
                placeholder="e.g. Red Cross"
              />
            </Field>
          </div>
        )}

        {state.error && (
          <p className="mt-4 text-sm text-coral">{state.error}</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
