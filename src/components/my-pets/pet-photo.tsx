// Pet photo with a paw fallback. Server-safe (no "use client").
/* eslint-disable @next/next/no-img-element -- Photos come from Supabase and seed URLs. Using next/image needs remote host config in next.config.ts (team decision). */

import { PawPrint } from "lucide-react";
import { cn } from "@/lib/cn";

export type PetPhotoProps = {
  name: string;
  imageUrl: string | null;
  /** Size and corners. Default: 48px square  */
  className?: string;
  iconSize?: number;
};

export function PetPhoto({
  name,
  imageUrl,
  className = "size-12 rounded-12",
  iconSize = 20,
}: PetPhotoProps) {
  // cn() only joins classes, so the size comes from one place only.
  const base = cn("shrink-0 object-cover", className);

  if (!imageUrl) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          base,
          "grid place-items-center bg-sage-soft text-olive-dark",
        )}
      >
        <PawPrint size={iconSize} />
      </span>
    );
  }

  return <img src={imageUrl} alt={`Photo of ${name}`} className={base} />;
}
