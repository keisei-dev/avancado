// UI library (P2): EmptyState
/**
 * Shown when a list has nothing in it, e.g. "No posts yet".
 * Icon (optional, a paw by default), title, short text, optional button.
 * Server-safe (no "use client").
 */

import type { ReactNode } from "react";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/cn";

export type EmptyStateProps = {
  title: string;
  text?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  text,
  icon = <PawPrint size={24} />,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-20 border border-dashed border-line-strong bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-2 grid size-14 place-items-center rounded-full bg-sage-soft text-olive">
        {icon}
      </span>

      <p className="font-semibold text-brown">{title}</p>

      {text && <p className="max-w-[360px] text-sm text-muted">{text}</p>}

      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
