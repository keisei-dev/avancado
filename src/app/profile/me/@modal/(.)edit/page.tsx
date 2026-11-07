"use client";

// Opens Edit profile as a modal when you click Edit on /profile/me.
// Refreshing /profile/me/edit shows the full page in edit/page.tsx instead.
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";

export default function EditProfileModal() {
    const router = useRouter();
    const [photo, setPhoto] = useState<File | null>(null);

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
            <div className="mt-6 flex justify-end gap-2">
                <h2 className="text-sm text-muted">
                    Petsitting Experience
                    <span className="text-xs"> (optional)</span>
                </h2>
                <Field
                    id="experience"
                    label="Experience"
                    hint="How long, which pets, and anything special. Shown on your public profile."
                >
                    <Textarea
                        id="experience"
                        placeholder="Enter your petsitting experience"
                        rows={4}
                    />
                </Field>
                <div className="full-field">
                    <span>Pets you can care for</span>
                    <div className="care-options">{(["dog", "cat"] as const).map((sp) => <button key={sp} type="button" aria-pressed={caresFor.includes(sp)} className={caresFor.includes(sp) ? "active" : ""} onClick={() => toggleCare(sp)}>{sp === "dog" ? <><Dog size={16} /> Dogs</> : <><Cat size={16} /> Cats</>}</button>)}</div></div>

            </div>
        </Modal>
    );
}
