// Pet photo with a paw fallback. Server-safe.
/* eslint-disable @next/next/no-img-element -- Photos come from Supabase and seed URLs. Using next/image needs remote host config in next.config.ts (team decision). */

import { PawPrint } from "lucide-react";
import { cn } from "@/lib/cn";

export type PetPhotoProps = {
  name: string;
  imageUrl: string | null;
  className?: string;
};

export function PetPhoto({ name, imageUrl, className }: PetPhotoProps) {
  const base = cn("size-12 shrink-0 rounded-12 object-cover", className);

  if (!imageUrl) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          base,
          "grid place-items-center bg-sage-faint text-olive-dark",
        )}
      >
        <PawPrint size={20} />
      </span>
    );
  }

  return <img src={imageUrl} alt={`Photo of ${name}`} className={base} />;
}
