"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAdmin, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="grid w-full max-w-[420px] gap-3.5">
      <div className="grid h-[52px] w-[52px] place-items-center rounded-16 bg-sage-soft text-olive-hover">
        <LockKeyhole aria-hidden="true" size={24} />
      </div>
      <p className="text-xs font-semibold tracking-[0.06em] text-olive-hover uppercase">
        Secure admin access
      </p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-brown">
        Welcome back
      </h2>
      <p className="mb-2 text-sm text-muted">
        Sign in with your administrator account to continue.
      </p>
      <label className="grid gap-1.5 text-[13px] font-semibold text-brown">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-12 rounded-12 border border-line bg-white px-3 text-sm font-normal text-brown outline-none focus:border-olive focus:ring-3 focus:ring-olive/25"
        />
      </label>
      <label className="grid gap-1.5 text-[13px] font-semibold text-brown">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter password"
          className="h-12 rounded-12 border border-line bg-white px-3 text-sm font-normal text-brown outline-none focus:border-olive focus:ring-3 focus:ring-olive/25"
        />
      </label>
      {state.error ? (
        <p
          role="alert"
          className="rounded-12 border border-coral/20 bg-coral-soft px-3 py-2 text-sm text-coral"
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-16 bg-olive text-sm font-bold text-white shadow-admin hover:bg-olive-hover disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
        {pending ? null : <ArrowRight aria-hidden="true" size={17} />}
      </button>
    </form>
  );
}
