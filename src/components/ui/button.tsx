// UI library (P1): Button, IconButton
/**
 * Button variants: primary (olive fill), secondary (outline), text, danger (coral).
 * Sizes: sm (36px), md (44px). States: hover, focus, disabled, loading. Pill shape.
 * IconButton: square-ish, icon only, needs an aria-label.
 * Server-safe (no "use client").
 */

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-olive text-white shadow-admin hover:bg-olive-hover",
  secondary:
    "border border-line-strong bg-white text-brown hover:border-beige hover:bg-ivory",
  text: "text-olive-dark hover:text-olive",
  danger: "bg-coral text-white hover:bg-coral-hover",
} as const;

const SIZES = {
  sm: "min-h-9 px-4 text-[13px]",
  md: "min-h-11 px-5 text-sm",
} as const;

/** Button look for things that aren't a <button>, e.g. a Next.js <Link>. */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors",
    "focus-visible:shadow-focus focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    variant !== "text" && SIZES[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, className })}
    >
      {loading && (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string; // required: icon-only buttons need a name
};

export function IconButton({
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "inline-grid size-[38px] place-items-center rounded-12  bg-white text-brown-2 transition-colors",
        "hover:text-brown hover:bg-ivory",
        "focus-visible:shadow-focus focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    />
  );
}
