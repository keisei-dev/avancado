"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Lock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { verifyIdentity, type SaveState } from "@/app/profile/me/action";

type VerificationFormProps = {
    mode?: "modal" | "page";
};

const FORM_ID = "verification-form";

const REQUIREMENTS = [
    "A valid, unexpired government-issued photo ID.",
    "The entire document is visible, with all edges showing.",
    "Your name, photo, and date of birth are clear and readable.",
    "The name matches the name on your Avancado profile.",
    "The image is clear, complete, and unaltered.",
];

export default function VerificationForm({
    mode = "modal",
}: VerificationFormProps) {
    const router = useRouter();
    const [photo, setPhoto] = useState<File | null>(null);
    const [confirmed, setConfirmed] = useState(false);


    function close() {
        if (mode === "page") {
            router.push("/profile/me");
        } else {
            router.back();
        }
    }

    async function saveAndClose(previous: SaveState, form: FormData) {
        const result = await verifyIdentity(previous, form);
        if (result.saved) close();
        return result;
    }

    const [state, formAction, pending] = useActionState<SaveState, FormData>(
        saveAndClose,
        { error: "", saved: false },
    );

    const form = (
        <form id={FORM_ID} action={formAction} className="flex flex-col gap-5">
            <Field id="documentType" label="Government-issued photo ID" required>
                <div className="relative">
                    <select
                        id="documentType"
                        name="documentType"
                        required
                        defaultValue="BCID"
                        className="h-12 w-full appearance-none rounded-12 border border-line-strong bg-white pr-10 pl-4 text-[15px] text-brown outline-none focus:border-olive"
                    >
                        <option value="BCID">BC Services Card / BCID</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="OTHER">Other government-issued photo ID</option>
                    </select>
                    <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
                    />
                </div>
            </Field>

            <Field
                id="idPhoto"
                label="Photo of your ID"
                hint="Make sure your name, photo and birth date are easy to read."
                required
            >
                <PhotoUpload
                    value={photo}
                    onChange={setPhoto}
                    label="Upload a photo of your ID"
                    hint="JPG or PNG"
                />
            </Field>

            <div className="rounded-12 bg-sage-faint p-4">
                <h3 className="mb-2 text-sm font-semibold text-brown">Before you upload</h3>
                <ul className="flex flex-col gap-1.5 text-sm text-brown-2">
                    {REQUIREMENTS.map((item) => (
                        <li key={item} className="flex gap-2">
                            <Check size={16} className="mt-0.5 shrink-0 text-olive-dark" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <p className="flex gap-2 rounded-12 bg-ivory p-3 text-sm text-muted">
                <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                Your ID is only accessible to our authorized verification team and will be securely deleted after review. Other members will only see your Verified badge.            </p>

            {state.error && (
                <p role="alert" className="text-sm text-coral">
                    {state.error}
                </p>
            )}

            <label className="flex items-start gap-3  bg-white cursor-pointer">
                <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-olive"
                    required
                />
                <span className="text-sm text-brown-2">
                    I confirm that my ID photo meets the requirements above and that all information is clear and accurate.
                <span className="text-sm text-coral">*</span>
                </span>
            </label>
        </form>
    );

    const buttons = (
        <>
            <Button variant="secondary" type="button" onClick={close}>
                Cancel
            </Button>
            <Button
                type="submit"
                form={FORM_ID}
                loading={pending}
                disabled={!photo || !confirmed}
            >
                Submit for review
            </Button>
        </>
    );

    if (mode === "page") {
        return (
            <div className="mx-auto max-w-lg rounded-16 border border-line bg-white p-6">
                <p className="mb-2 text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
                    Identity verification
                </p>
                <h1 className="font-display text-2xl font-bold">Verify your identity</h1>
                <p className="mt-2 mb-6 text-[15px] text-muted">
                    Get a verified badge to help other members feel more confident connecting with you.                </p>
                {form}
                <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row sm:justify-end">
                    {buttons}
                </div>
            </div>
        );
    }

    return (
        <Modal
            open
            eyebrow="Identity verification"
            title="Verify your identity"
            lead="Verified members get a badge that helps neighbours trust them."
            onClose={close}
            footer={buttons}
        >
            {form}

        </Modal>
    );
}
