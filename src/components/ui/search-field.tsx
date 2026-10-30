"use client";

// UI library (P2): SearchField
/**
 * Input with a search icon and a clear (×) button. Sizes sm (40px), md (48px).
 *
 * Two ways to use it:
 * - Simple (works in server pages): <SearchField label="Search places" name="q" />
 *   It keeps its own text. Put it in a <form> to submit `q`.
 * - Controlled (client components): pass `value` and `onValueChange`.
 *
 * Escape or × clears the text and keeps focus in the box.
 */

import { useRef, useState, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "min-h-10 gap-2 px-3 text-sm",
  md: "min-h-12 gap-2.5 px-4 text-[15px]",
} as const;

export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange"
> & {
  /** Read by screen readers, e.g. "Search places". Required: the box has no visible label. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: keyof typeof SIZES;
};

export function SearchField({
  label,
  value,
  defaultValue = "",
  onValueChange,
  size = "md",
  placeholder = "Search",
  disabled,
  className,
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ownValue, setOwnValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : ownValue;

  const update = (next: string) => {
    if (!controlled) setOwnValue(next);
    onValueChange?.(next);
  };

  const clear = () => {
    update("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex w-full items-center rounded-12 border border-line bg-white text-muted shadow-admin transition-[border-color,box-shadow]",
        "focus-within:border-olive focus-within:shadow-focus",
        disabled && "cursor-not-allowed opacity-60",
        SIZES[size],
        className,
      )}
    >
      <Search
        size={size === "sm" ? 16 : 18}
        aria-hidden="true"
        className="shrink-0"
      />
      <input
        ref={inputRef}
        type="search"
        aria-label={label}
        placeholder={placeholder}
        disabled={disabled}
        value={current}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && current) {
            event.preventDefault();
            clear();
          }
          onKeyDown?.(event);
        }}
        className="h-full min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {current && !disabled && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="grid size-[22px] shrink-0 place-items-center rounded-full bg-cream text-muted transition-colors hover:bg-line hover:text-brown focus-visible:shadow-focus focus-visible:outline-none"
        >
          <X size={13} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
