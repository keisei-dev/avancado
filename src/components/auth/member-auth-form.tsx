"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import {
  loginMember,
  signupMember,
  sendPasswordReset,
  resetPassword,
  resendVerification,
  type AuthState,
} from "@/app/(auth)/actions";
import { Button, buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const initialState: AuthState = { error: null };
const field =
  "min-h-12 w-full rounded-12 border border-line bg-white px-4 text-[15px] font-normal text-brown outline-none placeholder:text-placeholder focus:border-olive focus:shadow-focus";
const label = "grid gap-[7px] text-[13px] font-semibold";
const eyebrow =
  "text-xs font-semibold tracking-[.08em] text-olive-dark uppercase";

function ErrorMessage({ message }: { message?: string | null }) {
  return message ? (
    <p
      role="alert"
      className="rounded-12 border border-coral-line bg-coral-soft px-3 py-2 text-sm text-coral"
    >
      {message}
    </p>
  ) : null;
}

export function MemberAuthForm({
  signup = false,
  linkError = false,
}: {
  signup?: boolean;
  linkError?: boolean;
}) {
  const [state, action, pending] = useActionState(
    signup ? signupMember : loginMember,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (state.message)
    return (
      <div className="grid w-full max-w-[420px] justify-items-center gap-3.5 rounded-20 border border-line bg-white px-8 py-10 text-center shadow-card">
        <span className="grid size-16 place-items-center rounded-full bg-sage-soft text-olive-dark">
          <Mail size={30} aria-hidden="true" />
        </span>
        <span className={eyebrow}>Verify your email</span>
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Check your inbox
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          If this address can be registered, we’ve sent a verification link to{" "}
          <strong>{state.email}</strong>. Open the link to activate your
          account. If you already have an account, log in instead.
        </p>
        <Link
          href="/login"
          className={buttonClass({ className: "mt-2 w-full" })}
        >
          Back to log in <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <ResendVerificationForm email={state.email ?? ""} />
      </div>
    );

  return (
    <>
      <form
        action={action}
        className="grid w-full max-w-[420px] gap-3.5"
        aria-busy={pending}
      >
        <span className={eyebrow}>
          {signup ? "Create your account" : "Member login"}
        </span>
        <h2 className="-mt-1 font-display text-[30px] font-bold tracking-[-.03em]">
          {signup ? "Let’s get you started" : "Good to see you again"}
        </h2>
        <p className="-mt-2 mb-1.5 text-[15px] text-muted">
          {signup
            ? "It only takes a minute to join Avancado."
            : "Log in to post, react, message, and help with pet care."}
        </p>
        {signup && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              First name
              <input
                className={field}
                name="firstName"
                autoComplete="given-name"
                required
                maxLength={100}
                placeholder="Maya"
              />
            </label>
            <label className={label}>
              Last name
              <input
                className={field}
                name="lastName"
                autoComplete="family-name"
                required
                maxLength={100}
                placeholder="Thompson"
              />
            </label>
          </div>
        )}
        <label className={label}>
          Email address
          <input
            className={field}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
        <label className={label}>
          Password
          <span className="relative">
            <input
              className={`${field} pr-16`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              required
              minLength={signup ? 8 : undefined}
              maxLength={1024}
              placeholder={
                signup ? "At least 8 characters" : "Enter your password"
              }
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-[13px] font-semibold text-olive-dark focus-visible:shadow-focus focus-visible:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        {!signup && (
          <div className="flex justify-end text-[13px]">
            <button
              type="button"
              className="font-semibold text-olive-dark hover:underline"
              onClick={() => setResetOpen(true)}
            >
              Forgot password?
            </button>
          </div>
        )}
        {signup && (
          <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-brown-2">
            <input
              name="consent"
              type="checkbox"
              required
              className="mt-1 size-4 shrink-0 accent-olive"
            />
            <span>
              I agree to the Terms &amp; Conditions and acknowledge the Privacy
              Policy.
            </span>
          </label>
        )}
        <ErrorMessage
          message={
            state.error ||
            (linkError
              ? "This email link is invalid or has expired. Please log in or request a new password reset link."
              : null)
          }
        />
        <Button
          type="submit"
          loading={pending}
          className="mt-1 min-h-[50px] w-full text-[15px]"
        >
          {pending
            ? signup
              ? "Creating account…"
              : "Logging in…"
            : signup
              ? "Create account"
              : "Log in"}
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
        <div className="mt-1.5 flex flex-wrap justify-center gap-1.5 text-sm text-muted">
          <span>
            {signup ? "Already have an account?" : "New to Avancado?"}
          </span>
          <Link
            href={signup ? "/login" : "/signup"}
            className="font-semibold text-olive-dark hover:underline"
          >
            {signup ? "Log in" : "Create an account"}
          </Link>
        </div>
      </form>
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Forgot your password?"
        eyebrow="Reset password"
        lead="Enter the email you use for Avancado and we’ll send you a reset link."
      >
        {resetOpen && (
          <ForgotPasswordForm onClose={() => setResetOpen(false)} />
        )}
      </Modal>
    </>
  );
}

function ResendVerificationForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(
    resendVerification,
    initialState,
  );
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending}
        className="text-[13px] font-semibold text-olive-dark hover:underline disabled:opacity-50"
      >
        {pending ? "Sending…" : "Didn’t receive it? Resend verification email"}
      </button>
      <ErrorMessage message={state.error} />
      {state.message && (
        <p role="status" className="text-sm text-muted">
          {state.message}
        </p>
      )}
    </form>
  );
}

function ForgotPasswordForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(
    sendPasswordReset,
    initialState,
  );
  return state.message ? (
    <div className="grid gap-5">
      <p role="status" className="text-sm text-muted">
        {state.message}
      </p>
      <Button onClick={onClose}>Back to log in</Button>
    </div>
  ) : (
    <form action={action} className="grid gap-5">
      <label className={label}>
        Email address
        <input
          className={field}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
        />
      </label>
      <ErrorMessage message={state.error} />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          Send reset link
        </Button>
      </div>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, initialState);
  return (
    <form action={action} className="grid w-full max-w-[420px] gap-3.5">
      <span className={eyebrow}>Reset password</span>
      <h2 className="font-display text-3xl font-bold tracking-tight">
        Choose a new password
      </h2>
      {state.message ? (
        <>
          <p role="status" className="text-sm text-muted">
            {state.message}
          </p>
          <Link href="/login" className={buttonClass()}>
            Back to log in
          </Link>
        </>
      ) : (
        <>
          <label className={label}>
            New password
            <input
              className={field}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={1024}
              placeholder="At least 8 characters"
            />
          </label>
          <label className={label}>
            Confirm password
            <input
              className={field}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={1024}
            />
          </label>
          <ErrorMessage message={state.error} />
          <Button type="submit" loading={pending}>
            Update password
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-semibold text-olive-dark"
          >
            Back to log in
          </Link>
        </>
      )}
    </form>
  );
}
