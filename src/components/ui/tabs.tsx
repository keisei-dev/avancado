// UI library (P2): Tabs, SegmentedControl
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * SegmentedControl: pill track (e.g. Applied / Matched / Done).
 * Tabs: underline style (profile, settings).
 * Use role="tablist" / "tab" and arrow-key support. Needs "use client".
 */

"use client";

import type { ReactNode } from "react";

export function Tabs({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Request filters"
      className={` 
        inline-flex max-w-full items-center gap-1
        overflow-x-auto [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
        rounded-full bg-cream p-1
        mb-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function Tab({
  label,
  icon,
  count,
  selected = false,
  onClick,
  tone = "default",
}: {
  label: string;
  icon?: ReactNode;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  tone?: "default" | "lost";
}) {
  const isLost = tone === "lost";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`
        inline-flex min-h-[38px] shrink-0 items-center justify-center
        gap-[7px] rounded-full border-0 bg-transparent
        px-4 whitespace-nowrap
        text-sm font-semibold
        ${
          isLost
            ? "text-coral hover:text-coral"
            : "text-brown-2 hover:text-brown"
        }

        ${
          selected
            ? isLost
              ? "bg-white text-coral shadow-xs"
              : "bg-white text-brown shadow-xs"
            : ""
        }
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>

      {count !== undefined && (
        <span
          className={`
            inline-grid h-5 min-w-[22px] place-items-center
            rounded-full px-[7px]
            text-[11px] font-semibold

            ${
              isLost && selected
                ? "bg-coral-soft text-coral"
                : selected
                  ? "bg-sage text-olive-dark"
                  : "bg-white/70 text-muted"
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}
