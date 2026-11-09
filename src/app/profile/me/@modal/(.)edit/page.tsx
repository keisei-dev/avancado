"use client";

// Opens Edit profile as a modal when you click Edit on /profile/me.
// Refreshing /profile/me/edit shows the full page in edit/page.tsx instead.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Cat, Dog } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";

export default function EditProfileModal() {
    const router = useRouter();
    const [photo, setPhoto] = useState<File | null>(null);
    const [careSpecies, setCareSpecies] = useState<string[]>([]);

    // Click a pet type to add it, click again to remove it
    function toggleCare(species: string) {
        if (careSpecies.includes(species)) {
            setCareSpecies(careSpecies.filter((sp) => sp !== species));
        } else {
            setCareSpecies([...careSpecies, species]);
        }
    }

    return (
        <Modal open onClose={() => router.back()} title="Edit profile">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-olive">
                    Edit profile
                </p>
                <h1 className="mt-2 font-display text-2xl font-bold">
                    Update your public details
                </h1>
            </div>
            <div className="mt-4">
                <PhotoUpload value={photo} onChange={setPhoto} />
            </div>
            <div className="mt-4 space-y-4">
                <Field id="name" label="Name" required>
                    <Input id="name" placeholder="Enter your name" />
                </Field>
                <Field
                    id="bio"
                    label="About me"
                    hint="A short introduction for neighbours"
                    required
                >
                    <Textarea
                        id="bio"
                        placeholder="Enter your bio"
                        rows={4}
                    />
                </Field>
                <Field
                    id="location"
                    label="Neighbourhood"
                    hint="Neighbourhood only. Never your street address."
                >
                    <Input id="location" placeholder="Enter your neighbourhood" />
                </Field>

            </div>
            <div className="mt-6 space-y-4">
                <h2 className="text-sm font-semibold text-brown">
                    Pet sitting
                    <span className="text-xs font-normal text-muted"> (optional)</span>
                </h2>

                <div>
                    <p className="mb-2 text-sm font-medium text-brown">
                        Pets you can care for
                    </p>
                    <div className="flex gap-2">
                        {[
                            { value: "DOG", label: "Dogs", icon: <Dog size={16} aria-hidden="true" /> },
                            { value: "CAT", label: "Cats", icon: <Cat size={16} aria-hidden="true" /> },
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
                    <Input id="certificateName" placeholder="e.g. Pet First Aid" />
                </Field>
                <Field id="certificateIssuedBy" label="Issued by">
                    <Input id="certificateIssuedBy" placeholder="e.g. Red Cross" />
                </Field>
            </div>
        </Modal>
    );
}
