// One health log card on the pet dashboard. Server-safe.
// The body (charts, latest entries) is passed in as children.

import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { LOG_CONFIG } from "@/lib/pets/log-config";
import type { LogKind } from "@/lib/pets/types";
import { AddLogButton } from "./log-buttons";

export type HealthCardProps = {
  petId: string;
  kind: LogKind;
  subtitle: string;
  children: ReactNode;
};

export function HealthCard({
  petId,
  kind,
  subtitle,
  children,
}: HealthCardProps) {
  const config = LOG_CONFIG[kind];
  const Icon = config.icon;

  return (
    <article className="flex flex-col gap-3 rounded-20 border border-line bg-white p-5 shadow-card">
      <header className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-12 bg-sage-soft text-olive">
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
        className={buttonClass({
          variant: "text",
          size: "sm",
          className: "self-start",
        })}
      >
        View log
      </Link>
    </article>
  );
}
