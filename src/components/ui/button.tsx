// UI library (P1): Button, IconButton
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Variants: primary (olive fill), secondary (outline), text, danger (coral).
 * Sizes: sm, md. States: hover, focus, disabled, loading. Pill shape.
 * IconButton: round, icon only, needs an aria-label.
 * Server-safe (no "use client").
 */


import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" && "bg-olive text-white hover:bg-olive-dark",
        variant === "secondary" && "border border-olive text-olive hover:bg-olive-light",
        variant === "text" && "text-olive hover:bg-olive-light",
        variant === "danger" && "bg-coral text-white hover:bg-coral-dark",
        size === "sm" && "px-3 py-1 text-sm",
        size === "md" && "px-4 py-2 text-base",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
