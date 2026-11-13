"use client";

import { useSyncExternalStore } from "react";
import { AdminRangePills } from "@/components/admin/range-pills";
import { dashboardHref, type DashboardRange } from "@/lib/admin/date-range";

type AdminGreetingProps = {
  displayName: string;
  range: DashboardRange;
  from?: string;
  to?: string;
};

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

export function AdminGreeting({
  displayName,
  range,
  from,
  to,
}: AdminGreetingProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const now = isClient ? new Date() : null;

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
        <AdminRangePills
          range={range}
          from={from}
          to={to}
          size="md"
          options={[
            { id: "week", label: "Week" },
            { id: "month", label: "Month" },
          ]}
          hrefs={{
            week: dashboardHref({ range: "week" }),
            month: dashboardHref({ range: "month" }),
          }}
          clearHref={dashboardHref({ range: "week" })}
        />
      </div>
    </div>
  );
}
