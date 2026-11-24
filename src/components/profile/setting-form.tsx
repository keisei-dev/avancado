"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Lock, LogOut, Mail, UserX } from "lucide-react";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tab, Tabs } from "@/components/ui/tabs";
import {
    deactivateAccount,
    updatePassword,
    type SaveState,
} from "@/app/profile/me/action";

type Section = "password" | "deactivate";

type SettingFormProps = {
    mode?: "modal" | "page";
    email: string;
};

const FORM_ID = "setting-form";

const DEACTIVATE_STEPS = [
    { icon: EyeOff, text: "Your profile, posts, and pets will be hidden from other members." },
    { icon: LogOut, text: "You will be logged out and will not be able to access your account." },
    { icon: Mail, text: "Changed your mind? Contact us to reactivate your account" },
];

export default function SettingForm({
    mode = "modal",
    email,
}: SettingFormProps) {
    const router = useRouter();
    const [section, setSection] = useState<Section>("password");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deactivateError, setDeactivateError] = useState("");

    function close() {
        if (mode === "page") {
            router.push("/profile/me");
        } else {
            router.back();
        }
    }

    async function saveAndClose(previous: SaveState, form: FormData) {
        const result = await updatePassword(previous, form);
        if (result.saved) close();
        return result;
    }

    const [state, formAction, pending] = useActionState<SaveState, FormData>(
        saveAndClose,
        { error: "", saved: false },
    );

    async function confirmDeactivation() {
        const result = await deactivateAccount();
        if (!result.saved) {
            setDeactivateError(result.error);
            setConfirmOpen(false);
            return;
        }
        router.push("/login");
        router.refresh();
    }

    const tabs = (
        <Tabs className="mb-6 self-start">
            <Tab
                label="Password"
                icon={<Lock size={16} aria-hidden="true" />}
                selected={section === "password"}
                onClick={() => setSection("password")}
            />
            <Tab
                label="Deactivate account"
                icon={<UserX size={16} aria-hidden="true" />}
                selected={section === "deactivate"}
                onClick={() => setSection("deactivate")}
            />
        </Tabs>
    );

    const passwordForm = (
        <form id={FORM_ID} action={formAction} className="flex flex-col gap-5">
            {/* Read-only*/}
            <Field
                id="email"
                label="Email address"
                hint="This is the email address you use to sign in. Contact support if you need to change it."
            >
                <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="cursor-default bg-cream! text-muted! focus:border-line! focus:shadow-none!"
                />
            </Field>

            <Field id="currentPassword" label="Current password" required>
                <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </Field>
            <Field
                id="newPassword"
                label="New password"
                hint="At least 8 characters."
                required
            >
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />
            </Field>
            <Field id="confirmPassword" label="Confirm new password" required>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />
            </Field>

            {state.error && (
                <p role="alert" className="text-sm text-coral">
                    {state.error}
                </p>
            )}

            <div className="flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={close}>
                    Cancel
                </Button>
                <Button type="submit" loading={pending}>
                    Save changes
                </Button>
            </div>
        </form>
    );

    const deactivateSection = (
        <div className="flex flex-col gap-5">

            <h3 className="mb-3 text-sm font-semibold text-brown">
                When you deactivate
            </h3>
            <ul className="flex flex-col gap-3">
                {DEACTIVATE_STEPS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-brown-2">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-brown-2">
                            <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="pt-1.5">{text}</span>
                    </li>
                ))}
            </ul>

            {deactivateError && (
                <p role="alert" className="text-sm text-coral">
                    {deactivateError}
                </p>
            )}

            <div className="flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={close}>
                    Keep my account
                </Button>
                <Button
                    type="button"
                    variant="danger"
                    onClick={() => setConfirmOpen(true)}
                >
                    Deactivate account
                </Button>
            </div>
        </div>
    );

    const content = (
        <div className="flex flex-col">
            {tabs}
            {section === "password" ? passwordForm : deactivateSection}

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDeactivation}
                title="Deactivate your account?"
                description="This will hide your profile, posts and pets, and log you out."
                note="You can reactivate your account by contacting us."
                confirmLabel="Deactivate"
                tone="danger"
            />
        </div>
    );

    if (mode === "page") {
        return (
            <div className="mx-auto max-w-lg rounded-16 border border-line bg-white p-6">
                <p className="mb-2 text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
                    Account settings
                </p>
                <h1 className="mb-6 font-display text-2xl font-bold">
                    Update your account
                </h1>
                {content}
            </div>
        );
    }

    return (
        <Modal open eyebrow="Account settings" title="Update your account" onClose={close}>
            {content}
        </Modal>
    );
}
