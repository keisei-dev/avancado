// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-full flex-1 bg-white lg:grid-cols-[46%_54%]">
      <section className="relative hidden flex-col overflow-hidden bg-slate-900 px-12 py-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-44 -bottom-44 h-[440px] w-[440px] rounded-full border-[80px] border-sky-400/10"
        />
        <Link
          href="/"
          className="relative z-10 text-sm font-medium text-slate-300 hover:text-white"
        >
          ← Back to Avancado
        </Link>
        <div className="relative z-10 my-auto max-w-lg">
          <p className="text-lg font-bold">Avancado</p>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-300">
            Operations Console
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight">
            Care for the community behind every walk.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            Review content, manage reports, and keep Avancado safe and
            welcoming.
          </p>
        </div>
        <p className="relative z-10 text-xs text-slate-500">
          Trusted tools for a trusted pet community.
        </p>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <LoginForm />
      </section>
    </div>
  );
}
