"use client";

import { useState, useSyncExternalStore } from "react";
import { Calendar } from "lucide-react";

type AdminGreetingProps = {
  displayName: string;
};

type DashboardRange = "week" | "month" | "custom";

const emptySubscribe = () => () => {};

function formatDashboardDate(now: Date): string {
  return now.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function greetingForHour(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function AdminGreeting({ displayName }: AdminGreetingProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const now = isClient ? new Date() : null;
  const [range, setRange] = useState<DashboardRange>("week");

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-olive-hover">
        {now ? formatDashboardDate(now) : "\u00a0"}
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-bold tracking-tight text-brown">
            {now
              ? `${greetingForHour(now.getHours())}, ${displayName}`
              : `Welcome, ${displayName}`}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here is what is happening across Avancado today.
          </p>
        </div>
        <div
          role="group"
          aria-label="Dashboard date range"
          className="flex flex-wrap items-center gap-2"
        >
          <RangeButton
            label="Week"
            pressed={range === "week"}
            onClick={() => setRange("week")}
          />
          <RangeButton
            label="Month"
            pressed={range === "month"}
            onClick={() => setRange("month")}
          />
          <RangeButton
            label="Custom"
            pressed={range === "custom"}
            onClick={() => setRange("custom")}
            icon
          />
        </div>
      </div>
    </div>
  );
}

function RangeButton({
  label,
  pressed,
  onClick,
  icon = false,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium ${
        pressed
          ? "border-olive-hover bg-olive-hover text-white"
          : "border-line-strong bg-white text-brown-2"
      }`}
    >
      {icon ? <Calendar aria-hidden="true" size={14} /> : null}
      {label}
    </button>
  );
}
