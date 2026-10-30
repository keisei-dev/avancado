
"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-12 px-4 text-[15px]",
} as const;

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: keyof typeof SIZES;
  error?: boolean;
};

export function Input({
  value,
  defaultValue = "",
  onValueChange,
  size = "md",
  error = false,
  disabled,
  className,
  type = "text",
  ...props
}: InputProps) {
  const [ownValue, setOwnValue] = useState(defaultValue);

  const controlled = value !== undefined;
  const current = controlled ? value : ownValue;

  const update = (next: string) => {
    if (!controlled) setOwnValue(next);
    onValueChange?.(next);
  };

  return (
    <input
      {...props}
      type={type}
      value={current}
      disabled={disabled}
      aria-invalid={error || undefined}
      onChange={(event) => update(event.target.value)}
      className={cn(
        "w-full rounded-12 border bg-white text-brown outline-none",
        "transition-[border-color,box-shadow]",
        "placeholder:text-placeholder",
        "focus:border-olive focus:shadow-focus",
        error ? "border-coral" : "border-line",
        disabled && "cursor-not-allowed bg-cream opacity-60",
        SIZES[size],
        className,
      )}
    />
  );
}
