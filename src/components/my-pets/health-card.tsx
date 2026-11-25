// One health log card on the pet dashboard. Server-safe.
// The body (charts, latest entries) is passed in as children.

import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { LOG_CONFIG } from "@/lib/pets/log-config";
import type { LogKind } from "@/lib/pets/types";
import { AddLogButton } from "./log-buttons";
import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";

// Icon colours, like the design reference.
const ICON_TONES: Record<LogKind, string> = {
  toilet: "bg-sage-soft text-olive-dark",
  vaccine: "bg-sage-soft text-olive-dark",
  walk: "bg-sage-soft text-olive-dark",
  food: "bg-cream text-amber-ink",
  weight: "bg-cream text-amber-ink",
  vet: "bg-cream text-amber-ink",
  emergency: "bg-coral-soft text-coral",
};

export type HealthCardProps = {
  petId: string;
  kind: LogKind;
  subtitle: string;
  children: ReactNode;
  viewLabel?: string;
};

export function HealthCard({
  petId,
  kind,
  subtitle,
  viewLabel = "View log",
  children,
}: HealthCardProps) {
  const config = LOG_CONFIG[kind];
  const Icon = config.icon;

  return (
    <article className="flex flex-col gap-3 rounded-20 border border-line bg-white p-5 shadow-card">
      <header className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-12",
            ICON_TONES[kind],
          )}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-brown">{config.title}</h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <AddLogButton petId={petId} kind={kind} compact />
      </header>

      <div className="flex-1">{children}</div>

      <Link
        href={`/my-pets/${petId}/logs?kind=${kind}`}
        className="inline-flex items-center gap-0.5 self-start text-[13px] font-semibold text-olive-dark transition-colors hover:text-olive focus-visible:rounded-10 focus-visible:shadow-focus focus-visible:outline-none"
      >
        {viewLabel}
        <ChevronRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
