// UI library (P1): Badge, Tag
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Badge tones: green (verified, done), amber (pending, sponsored),
 * sky (info), coral (lost, error), neutral.
 * Tag: small label such as Sponsored, Vaccinated / Not yet, category.
 * Server-safe.
 */

import type { ReactNode } from "react";

export function Badge({
  children,
  tone,
  icon,
}: {
  children: ReactNode;
  tone: "default" | "green" | "amber" | "slate" | "red";
  icon?: ReactNode;
}) {
  const baseClasses =
    "inline-flex min-h-6 items-center gap-[5px] whitespace-nowrap rounded-full px-[10px] py-[4px] text-xs font-medium leading-none";

  const toneClasses = {
    default: "bg-sage-soft text-olive-dark",
    green: "bg-success-soft text-success",
    amber: "bg-amber-soft text-amber-ink",
    slate: "bg-slate-100 text-slate-700",
    red: "bg-coral-soft text-coral",
  };
  const iconClasses = {
    default: "text-olive-dark",
    green: "text-success",
    amber: "text-amber-ink",
    slate: "text-slate-700",
    red: "text-coral",
  };

  return (
    <span
      className={`${baseClasses} ${icon && iconClasses[tone]} ${toneClasses[tone]}`}
    >
      {icon && <span className="flex items-center [&_svg]:size-4">{icon}</span>}
      {children}
    </span>
  );
}
