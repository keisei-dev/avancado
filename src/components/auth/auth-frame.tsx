import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, MessagesSquare, PawPrint, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

export function AuthFrame({
  signup = false,
  children,
}: {
  signup?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-ivory text-brown tablet:grid-cols-2">
      <section
        className="relative flex min-h-[260px] flex-col justify-between gap-8 overflow-hidden bg-cover bg-center px-5 pt-6 pb-7 text-white tablet:px-14 tablet:pt-9 tablet:pb-10"
        style={{
          backgroundImage:
            'linear-gradient(160deg, rgba(58,45,32,.2), rgba(58,45,32,.82)), url("https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1400&q=80")',
        }}
      >
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded text-sm font-medium text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back to Avancado
        </Link>
        <div className="max-w-[460px]">
          <BrandLogo tone="dark" />
          <p className="mt-6 text-xs font-semibold tracking-[.1em] text-sage uppercase">
            Vancouver’s pet community
          </p>
          <h1 className="mt-3.5 mb-3.5 font-display text-[30px] leading-[1.08] font-bold tracking-[-.035em] tablet:text-[44px]">
            {signup
              ? "Join neighbours who care."
              : "Welcome back to your pack."}
          </h1>
          <p className="hidden text-[17px] leading-relaxed text-white/82 tablet:block">
            {signup
              ? "Create your profile, add your pets, and find trusted help close to home."
              : "Pick up your conversations, pet care, and community updates where you left off."}
          </p>
          <div className="mt-7 hidden gap-3 text-[15px] text-white/90 tablet:grid">
            <span className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-sage" aria-hidden="true" />{" "}
              Community-first safety tools
            </span>
            <span className="flex items-center gap-2.5">
              <MessagesSquare
                size={18}
                className="text-sage"
                aria-hidden="true"
              />{" "}
              Private neighbour messaging
            </span>
            <span className="flex items-center gap-2.5">
              <PawPrint size={18} className="text-sage" aria-hidden="true" />{" "}
              One home for every pet
            </span>
          </div>
        </div>
        <small className="hidden text-[13px] text-white/60 tablet:block">
          Built for Vancouver pets and their people.
        </small>
      </section>
      <section className="grid place-items-center px-7 py-10">
        {children}
      </section>
    </main>
  );
}
