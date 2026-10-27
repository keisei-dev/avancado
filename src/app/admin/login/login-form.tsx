"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="w-full max-w-md">
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-sky-100 text-sky-600">
        <LockIcon />
      </div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-sky-600">
        Secure admin access
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Welcome back
      </h2>
      <p className="mt-2 mb-8 text-sm text-slate-500">
        Sign in with your administrator account to continue.
      </p>
      <label className="mb-4 grid gap-2 text-sm font-semibold text-slate-700">
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@example.com"
          className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-sky-400 focus:ring-3 focus:ring-sky-600/10"
        />
      </label>
      <label className="mb-4 grid gap-2 text-sm font-semibold text-slate-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter password"
          className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-sky-400 focus:ring-3 focus:ring-sky-600/10"
        />
      </label>
      {state.error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in to console"}
      </button>
    </form>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
