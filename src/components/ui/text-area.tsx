
"use client";


import { useState, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: boolean;
};

export function Textarea({
  value,
  defaultValue = "",
  onValueChange,
  error = false,
  disabled,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const [ownValue, setOwnValue] = useState(defaultValue);

  const controlled = value !== undefined;
  const current = controlled ? value : ownValue;

  const update = (next: string) => {
    if (!controlled) setOwnValue(next);
    onValueChange?.(next);
  };

  return (
    <textarea
      {...props}
      rows={rows}
      value={current}
      disabled={disabled}
      aria-invalid={error || undefined}
      onChange={(event) => update(event.target.value)}
      className={cn(
        "w-full min-h-24 rounded-12 border bg-white px-4 py-3",
        "text-[15px] text-brown outline-none",
        "transition-[border-color,box-shadow]",
        "placeholder:text-placeholder",
        "focus:border-olive focus:shadow-focus",
        "resize-y",
        error ? "border-coral" : "border-line",
        disabled && "cursor-not-allowed bg-cream opacity-60",
        className,
      )}
    />
  );
}
