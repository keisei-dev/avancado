// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";
import { BrandMark } from "@/components/admin/brand-mark";

export const metadata: Metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-full flex-1 bg-ivory lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-olive-hover to-sidebar px-12 py-10 text-white lg:flex">
        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to Avancado
        </Link>
        <div className="relative z-10 my-auto max-w-lg">
          <div className="flex items-center gap-3">
            <BrandMark />
            <p className="font-display text-lg font-bold">Avancado</p>
          </div>
          <p className="mt-10 text-xs font-semibold tracking-[0.1em] text-sage uppercase">
            Operations Console
          </p>
          <h1 className="font-display mt-3.5 text-[44px] leading-[1.08] font-bold tracking-tight">
            Care for the community behind every walk.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-white/75">
            Review content, manage local places, and keep Avancado safe and
            welcoming.
          </p>
        </div>
        <p className="relative z-10 text-[13px] text-white/60">
          Trusted tools for a trusted pet community.
        </p>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <LoginForm />
      </section>
    </div>
  );
}
