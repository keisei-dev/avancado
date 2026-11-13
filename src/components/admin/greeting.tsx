"use client";

import { useSyncExternalStore } from "react";
import { AdminRangePills } from "@/components/admin/range-pills";
import {
  dashboardGreetingCopy,
  dashboardHref,
  type DashboardRange,
} from "@/lib/admin/date-range";

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

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function localYmd(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function rangeCopy(
  range: DashboardRange,
  from: string | undefined,
  to: string | undefined,
  now: Date | null,
) {
  if (range === "custom" && from && to && from === to && now) {
    if (from === localYmd(now)) {
      return "Here is what is happening across Avancado today.";
    }
  }
  return dashboardGreetingCopy(range, from, to);
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
            {rangeCopy(range, from, to, now)}
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
