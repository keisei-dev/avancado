// UI library (P2): BrandLogo
/**
 * Avocado mark + "Avancado". Light (on ivory) and dark (on the admin sidebar).
 * Server-safe.
 */

import Image from "next/image";
import { cn } from "@/lib/cn";

export type BrandLogoProps = {
  tone?: "light" | "dark";
  /** Extra classes for the word, e.g. "hidden wide:inline" to show the mark only. */
  nameClassName?: string;
  className?: string;
};

export function BrandLogo({
  tone = "light",
  nameClassName,
  className,
}: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/images/avancado-icon.png"
        alt=""
        width={266}
        height={387}
        priority
        className="h-[34px] w-auto"
      />
      <span
        className={cn(
          "font-display text-[21px] font-extrabold tracking-[-0.03em]",
          tone === "dark" ? "text-white" : "text-brown",
          nameClassName,
        )}
      >
        Avancado
      </span>
    </span>
  );
}
