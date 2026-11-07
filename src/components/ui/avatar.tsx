// UI library (P1): Avatar
/**
 * Round photo with an initials fallback. Sizes sm (32px), md (40px), lg (56px),
 * xl (96px, profile page).
 * Optional verified tick. Server-safe.
 */

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-24 text-3xl",
} as const;

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  verified?: boolean;
  className?: string;
};

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = "md",
  verified = false,
  className,
}: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        // Photos come from Supabase Storage; a plain img avoids next/image host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover", SIZES[size])}
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className={cn(
            "grid place-items-center rounded-full bg-sage-soft font-bold text-olive-dark",
            SIZES[size],
          )}
        >
          {initials(name)}
        </span>
      )}
      {verified && (
        <span
          className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full border-2 border-white bg-olive text-white"
          title="Verified"
        >
          <ShieldCheck size={9} strokeWidth={3} aria-hidden="true" />
          <span className="sr-only">Verified</span>
        </span>
      )}
    </span>
  );
}
